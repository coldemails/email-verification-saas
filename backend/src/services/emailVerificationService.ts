import validator from 'validator';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

interface VerificationResult {
  email: string;
  status: 'VALID' | 'INVALID' | 'UNKNOWN' | 'RISKY';
  syntaxValid: boolean;
  dnsValid: boolean;
  smtpValid: boolean | null;
  isDisposable: boolean;
  isCatchAll: boolean | null;
  isRole: boolean;
  isFreeProvider: boolean;
  reason?: string;
}

class EmailVerificationService {
  // Expanded list of disposable email domains
  private disposableDomains = new Set([
    'tempmail.com', 'guerrillamail.com', '10minutemail.com', 
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'sharklasers.com', 'spam4.me', 'maildrop.cc', 'yopmail.com',
    'fakeinbox.com', 'trashmail.com', 'getnada.com'
  ]);

  // List of free email providers
  private freeProviders = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
    'live.com', 'msn.com', 'yahoo.co.in', 'rediffmail.com'
  ]);

  // List of role-based email prefixes
  private roleAccounts = new Set([
    'admin', 'info', 'support', 'sales', 'contact', 'help',
    'marketing', 'noreply', 'no-reply', 'postmaster', 'webmaster',
    'billing', 'careers', 'hr', 'legal', 'privacy', 'security'
  ]);

  async verifyEmail(email: string): Promise<VerificationResult> {
    const result: VerificationResult = {
      email: email.toLowerCase().trim(),
      status: 'UNKNOWN',
      syntaxValid: false,
      dnsValid: false,
      smtpValid: null,
      isDisposable: false,
      isCatchAll: null,
      isRole: false,
      isFreeProvider: false
    };

    try {
      // Step 1: Syntax validation
      result.syntaxValid = this.validateSyntax(result.email);
      if (!result.syntaxValid) {
        result.status = 'INVALID';
        result.reason = 'Invalid email syntax';
        return result;
      }

      const domain = result.email.split('@')[1];
      const localPart = result.email.split('@')[0];

      // Step 2: Check for obviously fake patterns
      if (this.isFakeEmail(result.email, localPart, domain)) {
        result.status = 'INVALID';
        result.reason = 'Fake or test email pattern detected';
        return result;
      }

      // Step 3: Check disposable domains
      result.isDisposable = this.disposableDomains.has(domain);
      if (result.isDisposable) {
        result.status = 'RISKY';
        result.reason = 'Disposable email domain';
        return result;
      }

      // Step 4: Check role accounts
      result.isRole = this.roleAccounts.has(localPart.toLowerCase());
      if (result.isRole) {
        result.status = 'RISKY';
        result.reason = 'Role-based email account';
      }

      // Step 5: Check free providers
      result.isFreeProvider = this.freeProviders.has(domain);

      // Step 6: DNS validation (MX records)
      result.dnsValid = await this.validateDNS(domain);
      if (!result.dnsValid) {
        result.status = 'INVALID';
        result.reason = 'No MX records found - domain cannot receive emails';
        return result;
      }

      // Step 7: SMTP validation (skipped locally, will add with proxies)
      // result.smtpValid = await this.validateSMTP(email);

      // If we got here and not a role account, email looks valid
      if (!result.isRole) {
        result.status = 'VALID';
        result.reason = 'Email passed all checks';
      }

      return result;

    } catch (error) {
      result.status = 'UNKNOWN';
      result.reason = `Verification error: ${error}`;
      return result;
    }
  }

  private validateSyntax(email: string): boolean {
    // Basic validation
    if (!validator.isEmail(email)) return false;
    
    // Additional checks
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Check local part length
    if (localPart.length === 0 || localPart.length > 64) return false;
    
    // Check domain length
    if (domain.length === 0 || domain.length > 255) return false;
    
    // Check for consecutive dots
    if (email.includes('..')) return false;
    
    return true;
  }

  private isFakeEmail(email: string, localPart: string, domain: string): boolean {
    // Check for common test/fake patterns
    const fakePatterns = [
      'test', 'fake', 'example', 'demo', 'sample', 'dummy',
      'asdf', 'qwerty', 'nobody', 'noemail', 'null'
    ];
    
    // Check if local part matches fake patterns
    if (fakePatterns.some(pattern => localPart.toLowerCase().includes(pattern))) {
      return true;
    }
    
    // Check for example.com, test.com, etc.
    const fakeDomains = ['example.com', 'example.org', 'test.com', 'localhost'];
    if (fakeDomains.includes(domain.toLowerCase())) {
      return true;
    }
    
    // Check for obviously invalid patterns
    if (/^[0-9]+@/.test(email)) { // emails starting with only numbers
      return false; // Actually these can be valid
    }
    
    return false;
  }

  private async validateDNS(domain: string): Promise<boolean> {
    try {
      const addresses = await resolveMx(domain);
      return addresses && addresses.length > 0;
    } catch (error) {
      return false;
    }
  }

  // SMTP validation - we'll add this when we deploy with proxies
  // private async validateSMTP(email: string): Promise<boolean> {
  //   // Will implement with proxy rotation
  //   return true;
  // }
}

export default new EmailVerificationService();