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
 * Send welcome email to new users
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
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 16px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 32px;">✓</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Welcome to ${APP_NAME}!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Thanks for signing up! Your account has been created successfully.
                      </p>
                      
                      <!-- Free Credits Box -->
                      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Welcome Bonus</p>
                        <p style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff;">100 Credits</p>
                        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Free to get you started</p>
                      </div>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        You can start verifying your email lists right away. Our 12-layer verification engine will help you:
                      </p>
                      
                      <ul style="margin: 0 0 24px; padding-left: 20px; color: #475569;">
                        <li style="margin-bottom: 8px;">✓ Remove invalid emails</li>
                        <li style="margin-bottom: 8px;">✓ Detect disposable addresses</li>
                        <li style="margin-bottom: 8px;">✓ Identify role accounts</li>
                        <li style="margin-bottom: 8px;">✓ Verify SMTP deliverability</li>
                      </ul>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Go to Dashboard
                        </a>
                      </div>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                        If you have any questions, feel free to reply to this email. We're here to help!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                        © 2025 ${APP_NAME}. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">
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
 * Send password reset email
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
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 16px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 32px;">🔒</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Reset Your Password</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        We received a request to reset your password for your ${APP_NAME} account.
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Click the button below to choose a new password:
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Reset Password
                        </a>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                          <strong>⚠️ Security Notice:</strong><br>
                          This link will expire in <strong>1 hour</strong> for your security.
                        </p>
                      </div>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
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
 * Send payment receipt email (for future use)
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
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 32px;">✓</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Payment Successful!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Thank you for your purchase! Your credits have been added to your account.
                      </p>
                      
                      <!-- Receipt Details -->
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Credits Purchased:</td>
                            <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right;">${credits.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Amount Paid:</td>
                            <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right;">$${amount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">Transaction ID:</td>
                            <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: right; font-family: monospace;">${transactionId}</td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Start Verifying
                        </a>
                      </div>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                        Questions about your purchase? Reply to this email and we'll help you out.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
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
 * Send job completion notification (optional - can be disabled)
 */
export const sendJobCompletionEmail = async (
  email: string,
  name: string,
  jobId: string,
  fileName: string,
  totalEmails: number,
  validEmails: number,
  invalidEmails: number
): Promise<void> => {
  const downloadUrl = `${FRONTEND_URL}/dashboard`;
  const validPercentage = Math.round((validEmails / totalEmails) * 100);
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Email Verification Complete - ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 32px;">✓</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">Verification Complete!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                        Your email verification job for <strong>${fileName}</strong> is complete!
                      </p>
                      
                      <!-- Results -->
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Total Processed:</td>
                            <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right;">${totalEmails.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #10b981;">Valid Emails:</td>
                            <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #10b981; text-align: right;">${validEmails.toLocaleString()} (${validPercentage}%)</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #ef4444;">Invalid Emails:</td>
                            <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #ef4444; text-align: right;">${invalidEmails.toLocaleString()}</td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                          Download Results
                        </a>
                      </div>
                      
                      <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                        Your results are available in your dashboard and can be downloaded as a CSV file.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
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