import sgMail from "@sendgrid/mail";
import { logger } from "../utils/logger.utils";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
  logger.error("SendGrid API key or sender email not found in environment variables");
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface MessageProps {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
}

export class EmailService {
  static async sendMail(data: MessageProps): Promise<void> {
    if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
      logger.error("Cannot send email: SendGrid not configured");
      throw new Error("Email service not configured");
    }

    try {
      await sgMail.send({
        to: data.to,
        from: {
            email: SENDER_EMAIL,
            name: data.fromName || "Persona"
        },
        subject: data.subject,
        text: data.text,
        html: data.html || data.text,
      });
      logger.info(`Email sent to ${data.to}`);
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      throw error;
    }
  }

  static async sendDeleteAccountCode(email: string, code: string): Promise<void> {
    const subject = "Verify your account deletion";
    const text = `Your verification code to delete your Persona account is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`;
    
    // Improved HTML Template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Delete Account Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f172a; margin-bottom: 10px;">Persona</h1>
        </div>
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #0f172a;">Confirm Account Deletion</h2>
          <p>You requested to delete your Persona account. Use the code below to confirm this action:</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 6px; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${code}</span>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">This code will expire in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">If you did not request this, please ignore this email. Your account remains secure.</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Timeforge Persona. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({ 
        to: email, 
        subject, 
        text, 
        html,
        fromName: "Persona Security" 
    });
  }

  static async sendFeedbackEmail(userEmail: string, message: string): Promise<void> {
    const ADMIN_EMAIL = "himpraise571@gmail.com";
    const subject = `[Persona Feedback] New User Feedback`;
    const text = `User Feedback Received\n\nFrom: ${userEmail}\nMessage: ${message}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; line-height: 1.5; color: #333; padding: 20px;">
        <div style="border-left: 4px solid #3b82f6; padding-left: 15px;">
            <h2 style="margin-top: 0; color: #1e293b;">New User Feedback</h2>
            <p><strong>From:</strong> ${userEmail}</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; white-space: pre-wrap; border: 1px solid #e2e8f0;">${message}</div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({ 
        to: ADMIN_EMAIL, 
        subject, 
        text, 
        html,
        fromName: "Persona Feedback Bot"
    });
  }
}
