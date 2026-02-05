import axios from "axios";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { logger } from "../utils/logger.utils";

const PAYSTACK_SECRET = env.data?.PAYSTACK_SECRET_KEY;

export const PLANS = [
  { id: "1_credit", name: "1 AI Credit", credits: 1, price: 100 },
  { id: "8_credits", name: "8 AI Credits", credits: 8, price: 500 },
];

export class PaymentService {
  static async initializePayment(email: string, userId: string, planId: string) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error("Invalid plan selected");

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: plan.price * 100,
        metadata: {
          planId: plan.id,
          userId,
          credits: plan.credits,
        },
        callback_url: `${env.data?.CLIENT_URL}/buy-credits`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    return paystackResponse.data.data;
  }

  static async verifyPayment(reference: string) {
    // 1. Idempotency Check
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (existingTransaction && existingTransaction.status === "success") {
      return { status: "success", alreadyProcessed: true };
    }

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
      await this.fulfillOrder(data);
      return { status: "success", alreadyProcessed: false };
    }

    return { status: data.status, alreadyProcessed: false };
  }

  static async handleWebhook(event: any) {
    if (event.event === "charge.success") {
        await this.fulfillOrder(event.data);
    }
  }

  private static async fulfillOrder(data: any) {
    const { userId, credits } = data.metadata;
    const reference = data.reference;
    const amount = data.amount / 100;
    const purchaseAmount = parseInt(credits);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { reference },
      });
      if (existing && existing.status === "success") return;

      await tx.user.update({
        where: { id: userId },
        data: {
          purchasedAiCredits: { increment: purchaseAmount },
        },
      });

      await tx.transaction.create({
        data: {
          reference,
          userId,
          amount,
          credits: purchaseAmount,
          status: "success",
        },
      });

      logger.info(`Payment fulfilled: ${purchaseAmount} credits for User ${userId} (Ref: ${reference})`);
    });
  }
}
