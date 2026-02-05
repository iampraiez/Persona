import { prisma } from "../lib/prisma";
import { toUTCDate } from "../utils/date.util";

export class EventService {
  static async getUserEvents(userId: string) {
    return prisma.event.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    });
  }

  static async getUpcomingEvents(userId: string) {
    const now = new Date();
    const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: next24Hours,
        },
      },
      orderBy: { startTime: "asc" },
      take: 8,
    });
  }

  static async getEventsByDate(userId: string, dateObj: Date, view?: string) {
    let startDate: Date;
    let endDate: Date;

    if (view === "week") {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(dateObj);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(dateObj);
      endDate.setHours(23, 59, 59, 999);
    }

    return prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  static async createEvent(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const { title, description, startTime, endTime, notifyBefore } = data;

    return prisma.event.create({
      data: {
        title,
        description,
        startTime: toUTCDate(startTime) as Date,
        endTime: toUTCDate(endTime) as Date,
        notifyBefore: notifyBefore !== undefined ? parseInt(notifyBefore) : user.defaultNotifyBefore,
        userId: user.id,
      },
    });
  }

  static async updateEvent(userId: string, eventId: string, data: any) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) throw new Error("Event not found");

    const {
      title,
      description,
      startTime,
      endTime,
      isCompleted,
      skippedIsImportant,
      skippedReason,
      focusDuration,
    } = data;

    return prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        startTime: startTime ? toUTCDate(startTime) : undefined,
        endTime: endTime ? toUTCDate(endTime) : undefined,
        isCompleted,
        skippedIsImportant,
        skippedReason,
        focusDuration: focusDuration !== undefined ? parseInt(focusDuration) : undefined,
      },
    });
  }

  static async skipEvent(userId: string, eventId: string, data: any) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) throw new Error("Event not found");

    const { skippedReason, skippedIsImportant } = data;

    return prisma.event.update({
      where: { id: eventId },
      data: {
        isCompleted: false,
        skippedReason,
        skippedIsImportant,
        isSpecial: skippedIsImportant,
      },
    });
  }

  static async deleteEvent(userId: string, eventId: string) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) throw new Error("Event not found");

    return prisma.event.delete({
      where: { id: eventId },
    });
  }

  static async deleteEventsRange(userId: string, start: string, end: string) {
    return prisma.event.deleteMany({
      where: {
        userId,
        startTime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });
  }

  static async copyEvents(userId: string, data: any) {
    const { sourceStart, sourceEnd, targetStart } = data;

    const sStart = new Date(sourceStart);
    const sEnd = new Date(sourceEnd);
    const tStart = new Date(targetStart);
    
    const timeDiff = tStart.getTime() - sStart.getTime();

    const events = await prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: sStart,
          lte: sEnd,
        },
      },
    });

    if (events.length === 0) return [];

    const newEvents = await Promise.all(
      events.map((event) =>
        prisma.event.create({
          data: {
            title: event.title,
            description: event.description,
            startTime: new Date(event.startTime.getTime() + timeDiff),
            endTime: new Date(event.endTime.getTime() + timeDiff),
            notifyBefore: event.notifyBefore,
            userId,
          },
        })
      )
    );

    return newEvents;
  }
}
