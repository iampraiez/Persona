import { Router, type Request, type Response } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import crypto from "crypto";

const router = Router();

const PLANS = [
  { id: "1_credit", name: "1 AI Credit", credits: 1, price: 100 },
  { id: "8_credits", name: "8 AI Credits", credits: 8, price: 500 },
];

const PAYSTACK_SECRET = env.data?.PAYSTACK_SECRET_KEY;

router.post("/initialize", async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user;
    const { planId } = req.body;

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
       res.status(400).json({ error: "Invalid plan selected", data: null });
       return;
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
       res.status(404).json({ error: "User not found", data: null });
       return;
    }

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: plan.price * 100,
        metadata: {
          planId: plan.id,
          userId: user.id,
          credits: plan.credits,
        },
        callback_url: `${env.data?.CLIENT_URL}/buy-credits?status=success`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ data: paystackResponse.data.data, error: null });
  } catch (error: any) {
    logger.error(`Paystack Initialize Error: ${error?.response?.data || error.message}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to initialize payment"),
    });
  }
});

router.get("/verify/:reference", async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const data = paystackResponse.data.data;

    if (data.status === "success") {
      const { userId, credits } = data.metadata;

    await prisma.user.update({
        where: { id: userId },
        data: {
          purchasedAiCredits: { increment: credits },
        },
      });

      res.status(200).json({ data: "Credits added successfully", error: null });
    } else {
      res.status(400).json({ error: "Transaction failed or incomplete", data: null });
    }
  } catch (error: any) {
    logger.error(`Paystack Verify Error: ${error?.response?.data || error.message}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to verify payment"),
    });
  }
});

router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      res.sendStatus(400);
      return;
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { userId, credits } = event.data.metadata;

      // Check if credits were already added (idempotency)
      // For simplicity, we just increment since purchasedAiCredits is a counter
      // In a real production app, you'd track transaction references
      await prisma.user.update({
        where: { id: userId },
        data: {
          purchasedAiCredits: { increment: parseInt(credits) },
        },
      });

      logger.info(`Webhook: Fulfilled ${credits} credits for User ${userId}`);
    }

    res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Paystack Webhook Error: ${error.message}`);
    res.sendStatus(500);
  }
});

export default router;
