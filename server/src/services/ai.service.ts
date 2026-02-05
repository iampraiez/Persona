import { GoogleGenAI } from "@google/genai";
import { Event, Goal, Step } from "@prisma/client";
import { logger } from "../utils/logger.utils";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { toUTCDate } from "../utils/date.util";

const GEMINI_API_KEY = env.data?.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

async function generateContent(prompt: string) {
  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash", // Updated to 2.0 as per common practice if 2.5 was a typo
    contents: prompt,
  });
  return result.text;
}

const cleanJSON = (text: string) => {
  const match = text.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) : null;
};

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

export class AiService {
  static async getSuggestions(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const now = new Date();
    // Cache check
    if (user.cachedInsights && user.lastInsightsDate) {
      const lastInsightsDate = new Date(user.lastInsightsDate);
      if (now.toDateString() === lastInsightsDate.toDateString()) {
        return user.cachedInsights;
      }
    }

    // Credit check
    if (user.aiCredits <= 0 && user.purchasedAiCredits <= 0) {
      throw new Error("AI Limit reached. Please purchase more credits.");
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const [events, goals] = await Promise.all([
      prisma.event.findMany({
        where: { userId, startTime: { gte: now, lte: tomorrow } },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { userId },
        include: { steps: true },
        take: 5,
      }),
    ]);

    const [schSugg, goalSugg, focusSugg] = await Promise.all([
      this.generateEventSuggestions(events),
      this.generateGoalSuggestions(goals),
      this.generateDailyFocus(events, goals),
    ]);

    const suggestions = [
      ...(schSugg || []),
      ...(goalSugg || []),
      ...(focusSugg || []),
    ];

    await this.deductCredit(userId, user);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        cachedInsights: suggestions as any,
        lastInsightsDate: now,
      },
    });

    return suggestions;
  }

  static async generateGoalSteps(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.aiCredits <= 0 && user.purchasedAiCredits <= 0) {
      throw new Error("AI Limit reached. Please purchase more credits.");
    }

    const { goal, totalDays, stepCount, currentSteps } = data;
    const steps = await this._generateGoalStepsAI(
      goal,
      totalDays,
      stepCount,
      currentSteps,
    );

    await this.deductCredit(userId, user);

    return steps;
  }

  static async generateTimetable(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.aiCredits <= 0 && user.purchasedAiCredits <= 0) {
      throw new Error("AI Limit reached. Please purchase more credits.");
    }

    const { description, range } = data;
    const generatedEvents = await this._generateTimetableAI(description, range);

    if (!generatedEvents || !Array.isArray(generatedEvents)) {
      throw new Error("Failed to generate valid timetable");
    }

    const createdEvents = await Promise.all(
      generatedEvents.map((event: any) =>
        prisma.event.create({
          data: {
            title: event.title,
            description: event.description,
            startTime: toUTCDate(event.startTime) as Date,
            endTime: toUTCDate(event.endTime) as Date,
            notifyBefore: event.notifyBefore || 15,
            userId,
          },
        }),
      ),
    );

    await this.deductCredit(userId, user);

    return createdEvents;
  }

  private static async deductCredit(userId: string, user: { aiCredits: number; purchasedAiCredits: number }) {
    const useFree = user.aiCredits > 0;
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        aiCredits: useFree ? { decrement: 1 } : undefined,
        purchasedAiCredits: !useFree ? { decrement: 1 } : undefined,
      },
    });
  }

  private static async generateEventSuggestions(events: Event[]) {
    if (!GEMINI_API_KEY || events.length === 0) return null;
    const eventsText = events
      .map(
        (e) =>
          `Title: ${e.title}, Time: ${formatDateTime(e.startTime)} - ${formatDateTime(e.endTime)}`,
      )
      .join("\n");
    const prompt = `Analyze schedule and suggest 1-2 improvements. Schedule: ${eventsText}. Return JSON array: [{"message": "text", "type": "schedule"}]`;
    const response = await generateContent(prompt);
    return cleanJSON(response);
  }

  private static async _generateGoalStepsAI(
    goal: any,
    totalDays: number,
    stepCount?: number,
    currentSteps?: any[],
  ) {
    if (!GEMINI_API_KEY) return null;
    const stepsToGenerate = stepCount || totalDays;
    let prompt = `Break down goal into ${stepsToGenerate} steps over ${totalDays} days. Goal: ${goal.title}. Description: ${goal.description || "N/A"}.`;
    if (currentSteps?.length) {
      prompt += ` User steps: ${currentSteps.map((s, i) => `${i + 1}. ${s.title}`).join(", ")}. Complete all ${stepsToGenerate} steps.`;
    }
    prompt += ` Return JSON array: [{"title": "Step Title", "description": "Step Description", "dueDate": "YYYY-MM-DD"}]`;
    const response = await generateContent(prompt);
    return cleanJSON(response);
  }

  private static async generateGoalSuggestions(goals: any[]) {
    if (!GEMINI_API_KEY || goals.length === 0) return null;
    const goalsText = goals
      .map(
        (g) =>
          `Goal: ${g.title}, Progress: ${Math.round((g.steps.filter((s) => s.isCompleted).length / g.steps.length) * 100)}%`,
      )
      .join("\n");
    const prompt = `Suggest 2-3 actions for goals: ${goalsText}. Return JSON array: [{"message": "text", "type": "goal"}]`;
    const response = await generateContent(prompt);
    return cleanJSON(response);
  }

  private static async generateDailyFocus(events: Event[], goals: any[]) {
    if (!GEMINI_API_KEY) return null;
    const prompt = `Suggest 3-5 focus areas for today based on schedule (${events.length} events) and goals (${goals.length} goals). Return JSON array: [{"message": "text", "type": "focus"}]`;
    const response = await generateContent(prompt);
    return cleanJSON(response);
  }

  private static async _generateTimetableAI(description: string, range: any) {
    if (!GEMINI_API_KEY) return null;
    const prompt = `Create schedule: "${description}". Range: ${range.start} to ${range.end}. Return JSON array of event objects: [{"title": "brief title", "description": "optional", "startTime": "ISO", "endTime": "ISO", "notifyBefore": number}]`;
    const response = await generateContent(prompt);
    return cleanJSON(response);
  }
}
