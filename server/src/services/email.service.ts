import sgMail from "@sendgrid/mail";
import { logger } from "../utils/logger.utils";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
  logger.error(
    "SendGrid API key or sender email not found in environment variables",
  );
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
          name: data.fromName || "Persona",
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

  private static generateBaseTemplate(content: string, title: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 40px; text-align: center; background-color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #8b5cf6;">Timeforge Persona</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Timeforge Persona. All rights reserved.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">
                      Empowering your productivity with AI-driven scheduling.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  static async sendDeleteAccountCode(
    email: string,
    code: string,
  ): Promise<void> {
    const subject = "Verify your account deletion";
    const text = `Your verification code to delete your Persona account is: ${code}\n\nThis code will expire in 5 minutes.`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Confirm Account Deletion</h2>
      <p style="color: #475569; font-size: 16px;">You requested to delete your Persona account. Use the code below to confirm this action:</p>
      
      <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-radius: 8px; margin: 32px 0; border: 1px solid #e2e8f0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${code}</span>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">This code will expire in <strong>5 minutes</strong>.</p>
      <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">If you did not request this, please ignore this email. Your account remains secure.</p>
    `;

    await this.sendMail({
      to: email,
      subject,
      text,
      html: this.generateBaseTemplate(content, "Delete Account Verification"),
      fromName: "Persona Security",
    });
  }

  static async sendFeedbackEmail(
    userEmail: string,
    message: string,
  ): Promise<void> {
    const ADMIN_EMAIL = "himpraise571@gmail.com";
    const subject = `[Feedback] New message from ${userEmail}`;
    const text = `User Feedback Received\n\nFrom: ${userEmail}\nMessage: ${message}`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">New User Feedback</h2>
      <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">You have received a new feedback message from a user.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">From User</p>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #0f172a; font-weight: 500;">${userEmail}</p>
        
        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
        <div style="font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">This is an automated message from the Persona Feedback System.</p>
    `;

    await this.sendMail({
      to: ADMIN_EMAIL,
      subject,
      text,
      html: this.generateBaseTemplate(content, "New User Feedback"),
      fromName: "Persona Feedback Bot",
    });
  }

  static async sendUserDataExport(email: string, data: unknown): Promise<void> {
    const subject = "Your Persona Data Export";
    const text =
      "Attached is the data export you requested from Persona. This includes your profile, goals, and events.";
    const jsonStr = JSON.stringify(data, null, 2);
    const attachment = {
      content: Buffer.from(jsonStr).toString("base64"),
      filename: "persona_data.json",
      type: "application/json",
      disposition: "attachment",
    };

    if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
      logger.error("Cannot send email: SendGrid not configured");
      throw new Error("Email service not configured");
    }

    try {
      await sgMail.send({
        to: email,
        from: {
          email: SENDER_EMAIL,
          name: "Persona Data",
        },
        subject,
        text,
        attachments: [attachment],
      });
      logger.info(`Data export sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending data export: ${error}`);
      throw error;
    }
  }
}
