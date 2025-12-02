// UPDATED: Direct SMTP connection (no proxy)
// Replace backend/src/services/enhancedVerificationService.ts with this

import validator from 'validator';
import dns from 'dns';
import { promisify } from 'util';
import net from 'net';
import Redis from 'ioredis';

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface VerificationResult {
  email: string;
  status: 'VALID' | 'INVALID' | 'UNKNOWN' | 'RISKY';
  score: number;
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
  private disposableDomains = new Set([
    'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'sharklasers.com', 'spam4.me', 'maildrop.cc', 'yopmail.com',
  ]);

  private freeProviders = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  ]);

  private roleAccounts = new Set([
    'admin', 'info', 'support', 'sales', 'contact', 'help',
    'marketing', 'noreply', 'no-reply', 'postmaster', 'webmaster',
  ]);

  private typoDomainsMap: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
  };

  private validTLDs = new Set([
    'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
    'co', 'io', 'ai', 'app', 'dev', 'tech', 'xyz',
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in',
  ]);

  private dnsCache = new Map<string, any>();
  private cacheTimeout = 3600000; // 1 hour

  /**
   * Main verification method
   */
  async verifyEmail(email: string): Promise<VerificationResult> {
    const startTime = Date.now();
    email = email.toLowerCase().trim();

    // Layer 1: Syntax validation
    if (!validator.isEmail(email)) {
      return this.createResult(email, 'INVALID', 0, {
        syntaxValid: false,
        reason: 'Invalid email syntax'
      });
    }

    const [localPart, domain] = email.split('@');

    // Layer 2-8: Pre-SMTP checks
    const isDisposable = this.layer4_checkDisposable(domain);
    const typoSuggestion = this.layer5_checkTypo(domain);
    const hasValidTLD = this.layer6_checkTLD(domain);
    const isRole = this.layer7_checkRoleAccount(localPart);
    const isFreeProvider = this.layer8_checkFreeProvider(domain);

    if (isDisposable) {
      return this.createResult(email, 'INVALID', 20, {
        syntaxValid: true,
        isDisposable: true,
        reason: 'Disposable email domain'
      });
    }

    if (!hasValidTLD) {
      return this.createResult(email, 'INVALID', 10, {
        syntaxValid: true,
        hasValidTLD: false,
        reason: 'Invalid TLD'
      });
    }

    // Layer 9: DNS & MX validation
    const dnsResult = await this.layer9_validateDNS(domain);
    if (!dnsResult.hasMxRecord) {
      return this.createResult(email, 'INVALID', 30, {
        syntaxValid: true,
        dnsValid: dnsResult.hasARecord,
        mxValid: false,
        reason: 'No MX records found'
      });
    }

    // Layer 10-11: SPF & DMARC (optional checks)
    const spfValid = await this.layer10_checkSPF(domain);
    const dmarcValid = await this.layer11_checkDMARC(domain);

    // Layer 12: SMTP validation (DIRECT CONNECTION)
    let smtpValid: boolean | null = null;
    let isCatchAll: boolean | null = null;

    try {
      const smtpResult = await this.layer12_validateSMTP(email, dnsResult.mxRecords);
      smtpValid = smtpResult.isValid;
      isCatchAll = smtpResult.isCatchAll;
    } catch (error) {
      console.log('SMTP check failed:', error);
      smtpValid = null;
    }

    // Calculate final status and score
    let status: 'VALID' | 'INVALID' | 'UNKNOWN' | 'RISKY' = 'UNKNOWN';
    let score = 50;

    if (smtpValid === true && isCatchAll === false) {
      status = 'VALID';
      score = 90;
      if (isRole) score -= 10;
      if (isFreeProvider) score -= 5;
    } else if (smtpValid === false) {
      status = 'INVALID';
      score = 20;
    } else if (isCatchAll === true) {
      status = 'RISKY';
      score = 60;
    }

    return {
      email,
      status,
      score,
      checks: {
        syntaxValid: true,
        dnsValid: dnsResult.hasARecord,
        mxValid: dnsResult.hasMxRecord,
        smtpValid,
        spfValid,
        dkimValid: null,
        dmarcValid,
        isDisposable,
        isCatchAll,
        isRole,
        isFreeProvider,
        hasValidTLD,
        isGibberish: false,
        isDuplicate: false,
      },
      details: {
        domain,
        localPart,
        mxRecords: dnsResult.mxRecords,
        provider: this.detectProvider(dnsResult.mxRecords),
      },
      verifiedAt: new Date(),
    };
  }

  // LAYER 12: DIRECT SMTP VALIDATION (NO PROXY)
  private async layer12_validateSMTP(
    email: string, 
    mxRecords: string[]
  ): Promise<{ isValid: boolean; isCatchAll: boolean }> {
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, isCatchAll: false };
    }

    const mxHost = mxRecords[0];
    const domain = email.split('@')[1];

    try {
      // Test 1: Check real email
      const realEmailResult = await this.performDirectSMTPCheck(email, mxHost);

      if (realEmailResult === false) {
        // Real email rejected = INVALID
        return { isValid: false, isCatchAll: false };
      }

      // Test 2: Check fake email to detect catch-all
      const fakeEmail = `nonexistent${Date.now()}@${domain}`;
      const fakeEmailResult = await this.performDirectSMTPCheck(fakeEmail, mxHost);

      if (realEmailResult === true && fakeEmailResult === true) {
        // Both accepted = CATCH-ALL
        return { isValid: true, isCatchAll: true };
      }

      if (realEmailResult === true && fakeEmailResult === false) {
        // Only real accepted = VALID
        return { isValid: true, isCatchAll: false };
      }

      // Uncertain
      return { isValid: true, isCatchAll: null as any };

    } catch (error) {
      console.log('SMTP validation error:', error);
      return { isValid: null as any, isCatchAll: false };
    }
  }

  // NEW: Direct SMTP connection (no proxy)
  private async performDirectSMTPCheck(email: string, mxHost: string): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.createConnection(25, mxHost);
      socket.setTimeout(10000); // 10 second timeout
      socket.setEncoding('ascii');

      let buffer = '';
      const commands = [
        `EHLO verification.service\r\n`,
        `MAIL FROM:<verify@verification.service>\r\n`,
        `RCPT TO:<${email}>\r\n`,
        `QUIT\r\n`
      ];
      let step = 0;

      const cleanup = () => {
        try { socket.destroy(); } catch {}
      };

      socket.on('connect', () => {
        console.log(`✓ Connected to ${mxHost} for ${email}`);
      });

      socket.on('data', (data: string) => {
        buffer += data;

        try {
          // 220 = server greeting
          if (buffer.includes('220') && step === 0) {
            socket.write(commands[0]); // EHLO
            step++;
            buffer = '';
          }
          // 250 = command accepted
          else if (buffer.includes('250')) {
            if (step === 1) {
              socket.write(commands[1]); // MAIL FROM
              step++;
              buffer = '';
            } else if (step === 2) {
              socket.write(commands[2]); // RCPT TO
              step++;
              buffer = '';
            } else if (step === 3) {
              // RCPT TO accepted = email VALID
              socket.write(commands[3]); // QUIT
              cleanup();
              resolve(true);
            }
          }
          // 550/551/553 = email rejected
          else if (buffer.includes('550') || buffer.includes('551') || buffer.includes('553')) {
            socket.write(commands[3]); // QUIT
            cleanup();
            resolve(false);
          }
          // 450/451 = temporary error (rate limiting)
          else if (buffer.includes('450') || buffer.includes('451')) {
            socket.write(commands[3]); // QUIT
            cleanup();
            console.log('⚠️ Rate limited on', mxHost);
            resolve(null as any); // Uncertain
          }
        } catch (err) {
          cleanup();
          resolve(false);
        }
      });

      socket.on('error', (err) => {
        cleanup();
        console.log('Socket error:', err.message);
        resolve(false);
      });

      socket.on('timeout', () => {
        cleanup();
        console.log('Socket timeout on', mxHost);
        resolve(false);
      });
    });
  }

  // Layer 4: Disposable domain check
  private layer4_checkDisposable(domain: string): boolean {
    return this.disposableDomains.has(domain.toLowerCase());
  }

  // Layer 5: Typo check
  private layer5_checkTypo(domain: string): string | null {
    return this.typoDomainsMap[domain.toLowerCase()] || null;
  }

  // Layer 6: Valid TLD check
  private layer6_checkTLD(domain: string): boolean {
    const tld = domain.split('.').pop()?.toLowerCase();
    return tld ? this.validTLDs.has(tld) : false;
  }

  // Layer 7: Role account check
  private layer7_checkRoleAccount(localPart: string): boolean {
    return this.roleAccounts.has(localPart.toLowerCase());
  }

  // Layer 8: Free provider check
  private layer8_checkFreeProvider(domain: string): boolean {
    return this.freeProviders.has(domain.toLowerCase());
  }

  // Layer 9: DNS & MX validation
  private async layer9_validateDNS(
    domain: string
  ): Promise<{ hasARecord: boolean; hasMxRecord: boolean; mxRecords: string[] }> {
    const cacheKey = `dns_${domain}`;

    if (this.dnsCache.has(cacheKey)) {
      const cached = this.dnsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let hasARecord = false;
      try {
        const addresses = await resolve4(domain);
        hasARecord = addresses && addresses.length > 0;
      } catch {
        hasARecord = false;
      }

      let hasMxRecord = false;
      let mxRecords: string[] = [];

      try {
        const mxResults = await resolveMx(domain);
        hasMxRecord = mxResults && mxResults.length > 0;
        mxRecords = mxResults.map((mx) => mx.exchange);
      } catch {
        hasMxRecord = false;
      }

      const result = { hasARecord, hasMxRecord, mxRecords };
      this.dnsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return { hasARecord: false, hasMxRecord: false, mxRecords: [] };
    }
  }

  // Layer 10: SPF check
  private async layer10_checkSPF(domain: string): Promise<boolean> {
    try {
      const txtRecords = await resolveTxt(domain);
      const spfRecord = txtRecords.find((record) =>
        record.join('').startsWith('v=spf1')
      );
      return !!spfRecord;
    } catch {
      return false;
    }
  }

  // Layer 11: DMARC check
  private async layer11_checkDMARC(domain: string): Promise<boolean> {
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      const txtRecords = await resolveTxt(dmarcDomain);
      const dmarcRecord = txtRecords.find((record) =>
        record.join('').startsWith('v=DMARC1')
      );
      return !!dmarcRecord;
    } catch {
      return false;
    }
  }

  // Helper: Detect email provider from MX records
  private detectProvider(mxRecords: string[]): string | undefined {
    if (!mxRecords || mxRecords.length === 0) return undefined;

    const mx = mxRecords[0].toLowerCase();
    if (mx.includes('google') || mx.includes('gmail')) return 'Google Workspace';
    if (mx.includes('outlook') || mx.includes('microsoft')) return 'Microsoft 365';
    if (mx.includes('zoho')) return 'Zoho';
    if (mx.includes('protonmail')) return 'ProtonMail';
    return undefined;
  }

  // Helper: Create result object
  private createResult(
    email: string,
    status: 'VALID' | 'INVALID' | 'UNKNOWN' | 'RISKY',
    score: number,
    overrides: Partial<VerificationResult['checks'] & { reason?: string }>
  ): VerificationResult {
    const [localPart, domain] = email.split('@');
    return {
      email,
      status,
      score,
      checks: {
        syntaxValid: overrides.syntaxValid ?? false,
        dnsValid: overrides.dnsValid ?? false,
        mxValid: overrides.mxValid ?? false,
        smtpValid: overrides.smtpValid ?? null,
        spfValid: overrides.spfValid ?? null,
        dkimValid: null,
        dmarcValid: overrides.dmarcValid ?? null,
        isDisposable: overrides.isDisposable ?? false,
        isCatchAll: overrides.isCatchAll ?? null,
        isRole: overrides.isRole ?? false,
        isFreeProvider: overrides.isFreeProvider ?? false,
        hasValidTLD: overrides.hasValidTLD ?? false,
        isGibberish: false,
        isDuplicate: false,
      },
      details: {
        domain,
        localPart,
      },
      reason: overrides.reason,
      verifiedAt: new Date(),
    };
  }
}

export default new EnhancedEmailVerificationService();