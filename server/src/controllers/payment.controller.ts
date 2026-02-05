import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import crypto from "crypto";
import { env } from "../config/env";

const PAYSTACK_SECRET = env.data?.PAYSTACK_SECRET_KEY;

export class PaymentController {
  static async initialize(req: Request, res: Response) {
    try {
      const userEmail = req.user;
      const { planId } = req.body;

      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (!user) {
        return res.status(404).json({ error: "User not found", data: null });
      }

      const data = await PaymentService.initializePayment(user.email, user.id, planId);
      res.status(200).json({ data, error: null });
    } catch (error: any) {
      logger.error(`Initialize Error: ${error.message}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to initialize payment"),
      });
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      const result = await PaymentService.verifyPayment(reference as string);

      if (result.status === "success") {
        const message = result.alreadyProcessed 
            ? "Credits already added previously" 
            : "Credits added successfully";
        return res.status(200).json({ 
            data: { status: "success", message, reference }, 
            error: null 
        });
      }

      res.status(200).json({ 
        data: { status: result.status, message: `Transaction ${result.status}`, reference }, 
        error: null 
      });
    } catch (error: any) {
      logger.error(`Verify Error: ${error.message}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to verify payment"),
      });
    }
  }

  static async webhook(req: Request, res: Response) {
    try {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET!)
        .update(JSON.stringify(req.body))
        .digest("hex");

      const signature = req.headers["x-paystack-signature"] as string;

      if (hash !== signature) {
        return res.sendStatus(400);
      }

      await PaymentService.handleWebhook(req.body);
      res.sendStatus(200);
    } catch (error: any) {
      logger.error(`Webhook Error: ${error.message}`);
      res.sendStatus(500);
    }
  }
}
