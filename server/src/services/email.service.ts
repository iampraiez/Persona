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
        from: SENDER_EMAIL,
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
    const subject = "Delete Account Verification Code";
    const text = `Your verification code to delete your Persona account is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Delete Account Verification</h2>
        <p>Your verification code to delete your Persona account is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code will expire in 5 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await this.sendMail({ to: email, subject, text, html });
  }
}
