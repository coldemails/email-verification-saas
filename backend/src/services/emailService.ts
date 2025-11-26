import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sunnynewar.com';
const APP_NAME = 'OnlyValidEmails';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://onlyvalidemails.com';

/**
 * Send welcome email to new users - GMAIL OPTIMIZED
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${APP_NAME}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 20px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #0ea5e9; width: 60px; height: 60px; border-radius: 12px;">
                            <span style="color: #ffffff; font-size: 32px; line-height: 60px;">✓</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">Welcome to ${APP_NAME}!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        Thanks for signing up! Your account has been created successfully.
                      </p>
                      
                      <!-- Free Credits Box -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0ea5e9; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td align="center" style="padding: 24px;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-family: Arial, sans-serif;">Welcome Bonus</p>
                            <p style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1; font-family: Arial, sans-serif;">100 Credits</p>
                            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-family: Arial, sans-serif;">Free to get you started</p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        You can start verifying your email lists right away. Our 12-layer verification engine will help you:
                      </p>
                      
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 20px;">
                        <tr><td style="padding: 4px 0; font-size: 15px; color: #475569; font-family: Arial, sans-serif;">✓ Remove invalid emails</td></tr>
                        <tr><td style="padding: 4px 0; font-size: 15px; color: #475569; font-family: Arial, sans-serif;">✓ Detect disposable addresses</td></tr>
                        <tr><td style="padding: 4px 0; font-size: 15px; color: #475569; font-family: Arial, sans-serif;">✓ Identify role accounts</td></tr>
                        <tr><td style="padding: 4px 0; font-size: 15px; color: #475569; font-family: Arial, sans-serif;">✓ Verify SMTP deliverability</td></tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="background-color: #0ea5e9; border-radius: 12px;">
                            <a href="${FRONTEND_URL}/dashboard" style="display: block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; font-family: Arial, sans-serif;">
                        If you have any questions, feel free to reply to this email. We're here to help!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px 30px; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        © 2025 ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        <a href="${FRONTEND_URL}/privacy" style="color: #0ea5e9; text-decoration: none;">Privacy Policy</a> | 
                        <a href="${FRONTEND_URL}/terms" style="color: #0ea5e9; text-decoration: none;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error - registration should succeed even if email fails
  }
};

/**
 * Send password reset email - GMAIL OPTIMIZED
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 20px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #ef4444; width: 60px; height: 60px; border-radius: 12px;">
                            <span style="color: #ffffff; font-size: 32px; line-height: 60px;">🔒</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">Reset Your Password</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        We received a request to reset your password for your ${APP_NAME} account.
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        Click the button below to choose a new password:
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="background-color: #ef4444; border-radius: 12px;">
                            <a href="${resetUrl}" style="display: block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Notice -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e; font-family: Arial, sans-serif;">
                              <strong>⚠️ Security Notice:</strong><br>
                              This link will expire in <strong>1 hour</strong> for your security.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; font-family: Arial, sans-serif;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px 30px; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        © 2025 ${APP_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error; // Throw error for password reset (critical)
  }
};

/**
 * Send payment receipt email (for future use) - GMAIL OPTIMIZED
 */
export const sendPaymentReceiptEmail = async (
  email: string,
  name: string,
  amount: number,
  credits: number,
  transactionId: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Receipt - Credits Added',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 20px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #10b981; width: 60px; height: 60px; border-radius: 12px;">
                            <span style="color: #ffffff; font-size: 32px; line-height: 60px;">✓</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">Payment Successful!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                        Thank you for your purchase! Your credits have been added to your account.
                      </p>
                      
                      <!-- Receipt Details -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-family: Arial, sans-serif;">Credits Purchased:</td>
                                <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right; font-family: Arial, sans-serif;">${credits.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-family: Arial, sans-serif;">Amount Paid:</td>
                                <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right; font-family: Arial, sans-serif;">$${amount.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-family: Arial, sans-serif;">Transaction ID:</td>
                                <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: right; font-family: monospace;">${transactionId}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
                        <tr>
                          <td align="center" style="background-color: #0ea5e9; border-radius: 12px;">
                            <a href="${FRONTEND_URL}/dashboard" style="display: block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">
                              Start Verifying
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; font-family: Arial, sans-serif;">
                        Questions about your purchase? Reply to this email and we'll help you out.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px 30px; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        © 2025 ${APP_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Payment receipt sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending payment receipt:', error);
    // Don't throw error - payment already processed
  }
};

/**
 * Send job completion notification - GMAIL OPTIMIZED VERSION
 */
export const sendJobCompletionEmail = async (
  email: string,
  name: string,
  jobId: string,
  fileName: string,
  totalEmails: number,
  validEmails: number,
  invalidEmails: number,
  unknownEmails: number,
  processingTimeSeconds: number,
  averageSpeed: number
): Promise<void> => {
  const downloadUrl = `${FRONTEND_URL}/dashboard`;
  const validPercentage = Math.round((validEmails / totalEmails) * 100);
  const invalidPercentage = Math.round((invalidEmails / totalEmails) * 100);
  const unknownPercentage = Math.round((unknownEmails / totalEmails) * 100);
  
  // Format time nicely
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Verification Complete - ${totalEmails} emails in ${formatTime(processingTimeSeconds)}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 20px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #10b981; width: 60px; height: 60px; border-radius: 12px;">
                            <span style="color: #ffffff; font-size: 32px; line-height: 60px;">✓</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">Verification Complete!</h1>
                      <p style="margin: 8px 0 0; font-size: 16px; color: #64748b; font-family: Arial, sans-serif;">Hi ${name}, your email verification is ready</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      
                      <!-- Speed Highlight Box - SIMPLIFIED -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #dbeafe; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td align="center" style="padding: 24px 20px;">
                            <p style="margin: 0 0 12px; font-size: 48px; line-height: 1;">⚡</p>
                            <p style="margin: 0; font-size: 42px; font-weight: 700; color: #2563eb; line-height: 1; font-family: Arial, sans-serif;">${formatTime(processingTimeSeconds)}</p>
                            <p style="margin: 8px 0 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif;">TOTAL PROCESSING TIME</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 20px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td width="50%" align="center" style="padding: 8px;">
                                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">${averageSpeed}</p>
                                  <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">emails/sec</p>
                                </td>
                                <td width="50%" align="center" style="padding: 8px;">
                                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; font-family: Arial, sans-serif;">${totalEmails.toLocaleString()}</p>
                                  <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">emails processed</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- File Info - SIMPLIFIED -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 4px; font-weight: 600; color: #0f172a; font-size: 15px; font-family: Arial, sans-serif;">📄 ${fileName}</p>
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-family: Arial, sans-serif;">Verification completed • ${totalEmails.toLocaleString()} emails</p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Results - SIMPLIFIED -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="33%" style="padding: 0 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #d1fae5; border-radius: 12px;">
                              <tr>
                                <td align="center" style="padding: 16px 8px;">
                                  <p style="margin: 0 0 4px; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; font-family: Arial, sans-serif;">VALID</p>
                                  <p style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1; font-family: Arial, sans-serif;">${validEmails.toLocaleString()}</p>
                                  <p style="margin: 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">${validPercentage}%</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="33%" style="padding: 0 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fee2e2; border-radius: 12px;">
                              <tr>
                                <td align="center" style="padding: 16px 8px;">
                                  <p style="margin: 0 0 4px; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; font-family: Arial, sans-serif;">INVALID</p>
                                  <p style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1; font-family: Arial, sans-serif;">${invalidEmails.toLocaleString()}</p>
                                  <p style="margin: 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">${invalidPercentage}%</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="33%" style="padding: 0 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border-radius: 12px;">
                              <tr>
                                <td align="center" style="padding: 16px 8px;">
                                  <p style="margin: 0 0 4px; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; font-family: Arial, sans-serif;">UNKNOWN</p>
                                  <p style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1; font-family: Arial, sans-serif;">${unknownEmails.toLocaleString()}</p>
                                  <p style="margin: 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">${unknownPercentage}%</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px;">
                        <tr>
                          <td align="center" style="background-color: #0ea5e9; border-radius: 50px;">
                            <a href="${downloadUrl}" style="display: block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: Arial, sans-serif;">
                              View Results &amp; Download
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; font-size: 13px; text-align: center; color: #64748b; font-family: Arial, sans-serif;">
                        Your results are ready to download in CSV format
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px 30px; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        © 2025 ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif;">
                        <a href="${FRONTEND_URL}/privacy" style="color: #0ea5e9; text-decoration: none;">Privacy Policy</a> | 
                        <a href="${FRONTEND_URL}/terms" style="color: #0ea5e9; text-decoration: none;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    
    console.log(`✅ Job completion email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending job completion email:', error);
    // Don't throw error - job already completed
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentReceiptEmail,
  sendJobCompletionEmail
};