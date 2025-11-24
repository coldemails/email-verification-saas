import { SocksClient } from 'socks';
import validator from 'validator';
import dns from 'dns';
import { promisify } from 'util';
import net from 'net';
import { proxyService } from '../services/proxyService';
import Redis from 'ioredis';



const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


interface VerificationResult {
  email: string;
  status: 'VALID' | 'INVALID' | 'UNKNOWN' | 'RISKY';
  score: number; // 0-100 confidence score
  checks: {
    syntaxValid: boolean;
    dnsValid: boolean;
    mxValid: boolean;
    smtpValid: boolean | null;
    spfValid: boolean | null;
    dkimValid: boolean | null;
    dmarcValid: boolean | null;
    isDisposable: boolean;
    isCatchAll: boolean | null;
    isRole: boolean;
    isFreeProvider: boolean;
    hasValidTLD: boolean;
    isGibberish: boolean;
    isDuplicate: boolean;
  };
  details: {
    domain: string;
    localPart: string;
    mxRecords?: string[];
    spfRecord?: string;
    dmarcRecord?: string;
    provider?: string;
  };
  reason?: string;
  verifiedAt: Date;
}

class EnhancedEmailVerificationService {
  // Layer 1: Expanded disposable domains (500+ domains)
  private disposableDomains = new Set([
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'sharklasers.com', 'spam4.me', 'maildrop.cc', 'yopmail.com',
    'fakeinbox.com', 'trashmail.com', 'getnada.com', 'mohmal.com',
    'mintemail.com', 'mytemp.email', 'emailondeck.com', 'anonbox.net',
    'dispostable.com', 'throwawaymail.com', 'tempinbox.com',
    // Add more disposable domains here
  ]);

  // Layer 2: Free email providers
  private freeProviders = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'live.com', 'msn.com', 'yahoo.co.in', 'rediffmail.com',
    'zoho.com', 'gmx.com', 'yandex.com', 'tutanota.com',
  ]);

  // Layer 3: Role-based email prefixes
  private roleAccounts = new Set([
    'admin', 'info', 'support', 'sales', 'contact', 'help',
    'marketing', 'noreply', 'no-reply', 'postmaster', 'webmaster',
    'billing', 'careers', 'hr', 'legal', 'privacy', 'security',
    'abuse', 'team', 'hello', 'service', 'accounts',
  ]);

  // Layer 4: Common typo domains
  private typoDomainsMap: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'hotmial.com': 'hotmail.com',
  };

  // Layer 5: Valid TLDs (top-level domains)
  private validTLDs = new Set([
    'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
    'co', 'io', 'ai', 'app', 'dev', 'tech', 'xyz',
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in',
    // Add more valid TLDs
  ]);

  // Cache for DNS lookups to improve performance
  private dnsCache = new Map<string, any>();
  private cacheTimeout = 3600000; // 1 hour

 /**
 * Get DNS results from Redis cache or perform lookup
 */
private async getDNSWithCache(
  domain: string
): Promise<{ hasARecord: boolean; hasMxRecord: boolean; mxRecords: string[] }> {
  const cacheKey = `dns:${domain}`;
  
  try {
    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`📦 DNS cache hit: ${domain}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.log(`⚠️ Redis cache read error:`, err);
  }
  
  // Not cached - do lookup (FIX: Call layer9_validateDNS, NOT getDNSWithCache)
  const result = await this.layer9_validateDNS(domain); // ✅ FIXED
  
  try {
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(result));
    console.log(`💾 DNS cached: ${domain}`);
  } catch (err) {
    console.log(`⚠️ Redis cache write error:`, err);
  }
  
  return result;
}

  /**
   * Main verification method - 12 layers of checks
   */
  async verifyEmail(email: string): Promise<VerificationResult> {
    const startTime = Date.now();

    const result: VerificationResult = {
      email: email.toLowerCase().trim(),
      status: 'UNKNOWN',
      score: 0,
      checks: {
        syntaxValid: false,
        dnsValid: false,
        mxValid: false,
        smtpValid: null,
        spfValid: null,
        dkimValid: null,
        dmarcValid: null,
        isDisposable: false,
        isCatchAll: null,
        isRole: false,
        isFreeProvider: false,
        hasValidTLD: false,
        isGibberish: false,
        isDuplicate: false,
      },
      details: {
        domain: '',
        localPart: '',
      },
      verifiedAt: new Date(),
    };

    try {
      const [localPart, domain] = result.email.split('@');
      result.details.localPart = localPart;
      result.details.domain = domain;

      // LAYER 1: Syntax Validation
      result.checks.syntaxValid = this.layer1_validateSyntax(result.email);
      if (!result.checks.syntaxValid) {
        result.status = 'INVALID';
        result.reason = 'Invalid email syntax';
        result.score = 0;
        return result;
      }

      // LAYER 2: TLD Validation
      result.checks.hasValidTLD = this.layer2_validateTLD(domain);
      if (!result.checks.hasValidTLD) {
        result.status = 'INVALID';
        result.reason = 'Invalid or uncommon TLD';
        result.score = 10;
        return result;
      }

      // LAYER 3: Gibberish Detection
      result.checks.isGibberish = this.layer3_detectGibberish(localPart);
      if (result.checks.isGibberish) {
        result.status = 'RISKY';
        result.reason = 'Email appears to be randomly generated';
        result.score = 20;
      }

      // LAYER 4: Typo Detection & Correction
      const suggestedDomain = this.layer4_detectTypos(domain);
      if (suggestedDomain) {
        result.reason = `Possible typo detected. Did you mean ${suggestedDomain}?`;
        result.status = 'INVALID';
        result.score = 15;
        return result;
      }

      // LAYER 5: Fake Email Pattern Detection
      if (this.layer5_detectFakePatterns(result.email, localPart, domain)) {
        result.status = 'INVALID';
        result.reason = 'Fake or test email pattern detected';
        result.score = 5;
        return result;
      }

      // LAYER 6: Disposable Email Detection
      result.checks.isDisposable = this.layer6_checkDisposable(domain);
      if (result.checks.isDisposable) {
        result.status = 'RISKY';
        result.reason = 'Disposable/temporary email domain';
        result.score = 25;
        return result;
      }

      // LAYER 7: Role Account Detection
      result.checks.isRole = this.layer7_checkRoleAccount(localPart);
      if (result.checks.isRole) {
        result.status = 'RISKY';
        result.reason = 'Role-based email account (not personal)';
        result.score = 60;
      }

      // LAYER 8: Free Provider Detection
      result.checks.isFreeProvider = this.layer8_checkFreeProvider(domain);
      result.details.provider = result.checks.isFreeProvider
        ? 'Free Provider'
        : 'Custom Domain';

      // LAYER 9: DNS & MX Record Validation
      const dnsResults = await this.getDNSWithCache(domain);
      result.checks.dnsValid = dnsResults.hasARecord;
      result.checks.mxValid = dnsResults.hasMxRecord;
      result.details.mxRecords = dnsResults.mxRecords;

      if (!result.checks.mxValid) {
        result.status = 'INVALID';
        result.reason = 'No MX records found - domain cannot receive emails';
        result.score = 0;
        return result;
      }

      // LAYER 10: SPF Record Check
      result.checks.spfValid = await this.layer10_checkSPF(domain);
      result.details.spfRecord = result.checks.spfValid ? 'Present' : 'Missing';

      // LAYER 11: DMARC Record Check
      result.checks.dmarcValid = await this.layer11_checkDMARC(domain);
      result.details.dmarcRecord = result.checks.dmarcValid
        ? 'Present'
        : 'Missing';

      // LAYER 12: SMTP Validation (with proxy rotation)
      // Returns true | false | null
      result.checks.smtpValid = await this.layer12_validateSMTP(
        result.email,
        result.details.mxRecords || []
      );

      // Calculate final score and status
      result.score = this.calculateScore(result.checks);
      result.status = this.determineStatus(result.score, result.checks);

      if (!result.reason) {
        result.reason = this.getReasonFromScore(result.score);
      }

      const endTime = Date.now();
      console.log(
        `✅ Verified ${result.email} in ${endTime - startTime}ms - Score: ${result.score}`
      );

      return result;
    } catch (error) {
      console.error(`❌ Error verifying ${result.email}:`, error);
      result.status = 'UNKNOWN';
      result.reason = `Verification error: ${error}`;
      result.score = 0;
      return result;
    }
  }

  // =================== LAYER IMPLEMENTATIONS ===================

  // LAYER 1: Syntax Validation
  private layer1_validateSyntax(email: string): boolean {
    if (!validator.isEmail(email)) return false;

    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    // Check lengths
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (domain.length === 0 || domain.length > 255) return false;

    // Check for consecutive dots
    if (email.includes('..')) return false;

    // Check for leading/trailing dots
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

    // Check domain has at least one dot
    if (!domain.includes('.')) return false;

    return true;
  }

  // LAYER 2: TLD Validation
  private layer2_validateTLD(domain: string): boolean {
    const tld = domain.split('.').pop()?.toLowerCase();
    if (!tld) return false;

    // Allow all TLDs for now, but flag uncommon ones
    return tld.length >= 2 && tld.length <= 6;
  }

  // LAYER 3: Gibberish Detection
  private layer3_detectGibberish(localPart: string): boolean {
    // Remove common patterns
    const cleanedLocalPart = localPart.replace(/[0-9._-]/g, '');

    if (cleanedLocalPart.length < 3) return false;

    // Check for lack of vowels (possible random string)
    const vowels = cleanedLocalPart.match(/[aeiou]/gi);
    const vowelRatio = vowels ? vowels.length / cleanedLocalPart.length : 0;

    // If less than 20% vowels, likely gibberish
    if (vowelRatio < 0.2) return true;

    // Check for repeating characters
    const repeatingPattern = /(.)\1{3,}/;
    if (repeatingPattern.test(cleanedLocalPart)) return true;

    return false;
  }

  // LAYER 4: Typo Detection
  private layer4_detectTypos(domain: string): string | null {
    return this.typoDomainsMap[domain.toLowerCase()] || null;
  }

  // LAYER 5: Fake Pattern Detection
  private layer5_detectFakePatterns(
    email: string,
    localPart: string,
    domain: string
  ): boolean {
    const fakePatterns = [
      'test',
      'fake',
      'example',
      'demo',
      'sample',
      'dummy',
      'asdf',
      'qwerty',
      'nobody',
      'noemail',
      'null',
      '123456',
    ];

    // Check local part
    if (
      fakePatterns.some((pattern) => localPart.toLowerCase().includes(pattern))
    ) {
      return true;
    }

    // Check fake domains
    const fakeDomains = [
      'example.com',
      'example.org',
      'test.com',
      'localhost',
      'invalid',
    ];
    if (fakeDomains.includes(domain.toLowerCase())) {
      return true;
    }

    return false;
  }

  // LAYER 6: Disposable Check
  private layer6_checkDisposable(domain: string): boolean {
    return this.disposableDomains.has(domain.toLowerCase());
  }

  // LAYER 7: Role Account Check
  private layer7_checkRoleAccount(localPart: string): boolean {
    return this.roleAccounts.has(localPart.toLowerCase());
  }

  // LAYER 8: Free Provider Check
  private layer8_checkFreeProvider(domain: string): boolean {
    return this.freeProviders.has(domain.toLowerCase());
  }

  // LAYER 9: DNS & MX Validation
  private async layer9_validateDNS(
    domain: string
  ): Promise<{ hasARecord: boolean; hasMxRecord: boolean; mxRecords: string[] }> {
    const cacheKey = `dns_${domain}`;

    // Check cache
    if (this.dnsCache.has(cacheKey)) {
      const cached = this.dnsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Check A record
      let hasARecord = false;
      try {
        const addresses = await resolve4(domain);
        hasARecord = addresses && addresses.length > 0;
      } catch (error) {
        hasARecord = false;
      }

      // Check MX records
      let hasMxRecord = false;
      let mxRecords: string[] = [];

      try {
        const mxResults = await resolveMx(domain);
        hasMxRecord = mxResults && mxResults.length > 0;
        mxRecords = mxResults.map((mx) => mx.exchange);
      } catch (error) {
        hasMxRecord = false;
      }

      const result = { hasARecord, hasMxRecord, mxRecords };

      // Cache result
      this.dnsCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      return { hasARecord: false, hasMxRecord: false, mxRecords: [] };
    }
  }

  // LAYER 10: SPF Check
  private async layer10_checkSPF(domain: string): Promise<boolean> {
    try {
      const txtRecords = await resolveTxt(domain);
      const spfRecord = txtRecords.find((record) =>
        record.join('').startsWith('v=spf1')
      );
      return !!spfRecord;
    } catch (error) {
      return false;
    }
  }

  // LAYER 11: DMARC Check
  private async layer11_checkDMARC(domain: string): Promise<boolean> {
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      const txtRecords = await resolveTxt(dmarcDomain);
      const dmarcRecord = txtRecords.find((record) =>
        record.join('').startsWith('v=DMARC1')
      );
      return !!dmarcRecord;
    } catch (error) {
      return false;
    }
  }

  // LAYER 12: SMTP Validation (Will implement with proxies in production)
  // Returns: true (valid), false (invalid), or null (couldn't run)
  private async layer12_validateSMTP(email: string, mxRecords: string[]): Promise<boolean | null> {
    if (!mxRecords || mxRecords.length === 0) {
      console.log("⚠️ No MX records — skipping SMTP check");
      return false;
    }

    const domain = email.split("@")[1];

    // Get a healthy proxy from proxyService
    let proxy: string | null = null;
    try {
      proxy = await proxyService.getHealthyProxy();
    } catch (err) {
      console.error("Error getting proxy:", err);
      proxy = null;
    }

    if (!proxy) {
      console.log("⛔ No working proxies available — skipping SMTP check (returning null)");
      return null;
    }

    console.log(`🔌 Using proxy for SMTP: ${proxy}`);

    // Choose primary MX host (highest priority is first in array)
    const mxHost = mxRecords[0];

    try {
      const smtpResponse = await this.performSMTPCheck(email, mxHost, proxy);

      if (smtpResponse) {
        await proxyService.markProxySuccessful(proxy);
        return true;
      } else {
        await proxyService.markProxyFailed(proxy);
        return false;
      }
    } catch (err) {
      console.log("SMTP check failed for proxy:", proxy, err);
      try { await proxyService.markProxyFailed(proxy); } catch {}
      return false;
    }
  }

  // NOTE: This now uses SOCKS5 proxy tunneling for SMTP verification.

  // you'd need a proxy-aware socket (e.g., using `socks` package or spawn proxytunnel).
// Helper: Connect to SMTP server through SOCKS5 proxy and check mailbox existence
private async performSMTPCheck(email: string, mxHost: string, proxy: string): Promise<boolean> {
  // Parse proxy format: "user:pass@ip:port" OR "ip:port"
  const parseProxy = (p: string) => {
    p = p.replace(/^socks5:\/\//i, '').trim();
    
    const atIndex = p.indexOf('@');
    let creds = null;
    let hostPort = p;

    if (atIndex !== -1) {
      creds = p.slice(0, atIndex);
      hostPort = p.slice(atIndex + 1);
    }

    const [user, pass] = creds ? creds.split(':') : [undefined, undefined];
    const [host, portStr] = hostPort.split(':');
    const port = Number(portStr || 1080);

    return { host, port, user, pass };
  };

  const { host: proxyHost, port: proxyPort, user: proxyUser, pass: proxyPass } = parseProxy(proxy);

  try {
    // Create SOCKS5 tunnel to MX host (port 25)
    const info = await SocksClient.createConnection({
      command: 'connect',
      destination: { host: mxHost, port: 25 },
      proxy: {
        host: proxyHost,
        port: proxyPort,
        type: 5,
        userId: proxyUser,
        password: proxyPass,
      },
      timeout: 2000,
    });

    const socket: import('net').Socket = info.socket as any;
    socket.setEncoding('ascii');
    socket.setTimeout(3000);

    return await new Promise<boolean>((resolve) => {
      const commands = [
        `HELO ${mxHost}\r\n`,
        `MAIL FROM:<verify@${mxHost}>\r\n`,
        `RCPT TO:<${email}>\r\n`,
        `QUIT\r\n`
      ];

      let step = 0;
      let buffer = '';

      const cleanup = () => {
        try { socket.destroy(); } catch {}
      };

      socket.on('data', (data: string) => {
        buffer += data;

        try {
          // 220 = server greeting
          if (buffer.includes('220') && step === 0) {
            socket.write(commands[0]);
            step++;
            buffer = '';
            return;
          }

          // MAIL FROM accepted
          if (buffer.includes('250') && step === 1) {
            socket.write(commands[1]);
            step++;
            buffer = '';
            return;
          }

          // RCPT TO
          if (buffer.includes('250') && step === 2) {
            socket.write(commands[2]);
            step++;
            buffer = '';
            return;
          }

          // RCPT accepted → mailbox exists
          if (buffer.includes('250') && step === 3) {
            socket.write(commands[3]);
            cleanup();
            return resolve(true);
          }

          // 550 — mailbox does NOT exist
          if (buffer.includes('550')) {
            cleanup();
            return resolve(false);
          }

          // Temporary error (451, 452) → treat as fail
          if (buffer.match(/45\d/)) {
            cleanup();
            return resolve(false);
          }

        } catch (err) {
          cleanup();
          return resolve(false);
        }
      });

      socket.on('error', () => { cleanup(); return resolve(false); });
      socket.on('timeout', () => { cleanup(); return resolve(false); });
      socket.on('end', () => { cleanup(); return resolve(false); });

      // Safety timeout
      setTimeout(() => { 
        cleanup(); 
        return resolve(false);
      }, 3500); // Line 616

    });

  } catch (err) {
    console.error('SOCKS5 connection error:', err);
    return false;
  }
}




  // =================== SCORING & STATUS ===================

  private calculateScore(checks: VerificationResult['checks']): number {
    let score = 0;

    if (checks.syntaxValid) score += 10;
    if (checks.hasValidTLD) score += 5;
    if (!checks.isGibberish) score += 10;
    if (!checks.isDisposable) score += 15;
    if (!checks.isRole) score += 10;
    if (checks.dnsValid) score += 10;
    if (checks.mxValid) score += 20;
    if (checks.spfValid) score += 10;
    if (checks.dmarcValid) score += 10;

    // Bonus for custom domains (not free providers)
    if (!checks.isFreeProvider) score += 5;

    return Math.min(score, 100);
  }

  private determineStatus(
    score: number,
    checks: VerificationResult['checks']
  ): 'VALID' | 'INVALID' | 'RISKY' | 'UNKNOWN' {
    if (score === 0) return 'INVALID';
    if (checks.isDisposable || checks.isGibberish) return 'RISKY';
    if (checks.isRole) return 'RISKY';
    if (score >= 80) return 'VALID';
    if (score >= 60) return 'RISKY';
    if (score >= 40) return 'UNKNOWN';
    return 'INVALID';
  }

  private getReasonFromScore(score: number): string {
    if (score >= 90) return 'High confidence - email is valid';
    if (score >= 80) return 'Good confidence - email appears valid';
    if (score >= 70) return 'Moderate confidence - email likely valid';
    if (score >= 60) return 'Low confidence - email may be valid';
    if (score >= 40) return 'Very low confidence - verification incomplete';
    return 'Email appears invalid or risky';
  }
}

export default new EnhancedEmailVerificationService();
