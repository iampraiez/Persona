import { EmailService } from "./email.service";

export class FeedbackService {
  static async sendFeedback(userEmail: string, message: string) {
    return EmailService.sendFeedbackEmail(userEmail, message);
  }
}
