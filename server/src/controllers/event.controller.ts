import { Request, Response } from "express";
import { EventService } from "../services/event.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class EventController {
  private static async getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user.id;
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const events = await EventService.getUserEvents(userId);
      res.status(200).json({ data: events, error: null });
    } catch (error: unknown) {
      logger.error(`Get Events Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to get events") });
    }
  }

  static async getUpcoming(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const events = await EventService.getUpcomingEvents(userId);
      res.status(200).json({ data: events, error: null });
    } catch (error: unknown) {
      logger.error(`Get Upcoming Events Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to get upcoming events") });
    }
  }

  static async getByDate(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { date, view } = req.query;
      const dateObj = date ? new Date(date as string) : new Date();

      const events = await EventService.getEventsByDate(userId, dateObj, view as string);
      res.status(200).json({ data: events, error: null });
    } catch (error: unknown) {
      logger.error(`Get Events by Date Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to get events") });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const newEvent = await EventService.createEvent(userId, req.body);
      res.status(201).json({ data: newEvent, error: null });
    } catch (error: unknown) {
      logger.error(`Create Event Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to create event") });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      const updatedEvent = await EventService.updateEvent(userId, id as string, req.body);
      res.status(200).json({ data: updatedEvent, error: null });
    } catch (error: any) {
      logger.error(`Update Event Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to update event") });
    }
  }

  static async skip(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      const updatedEvent = await EventService.skipEvent(userId, id as string, req.body);
      res.status(200).json({ data: updatedEvent, error: null });
    } catch (error: any) {
      logger.error(`Skip Event Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to skip event") });
    }
  }

  static async deleteOne(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      await EventService.deleteEvent(userId, id as string);
      res.status(200).json({ data: "Event deleted successfully", error: null });
    } catch (error: any) {
      logger.error(`Delete Event Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to delete event") });
    }
  }

  static async deleteRange(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { start, end } = req.query;
      if (!start || !end) return res.status(400).json({ error: "Start and end dates are required", data: null });

      await EventService.deleteEventsRange(userId, start as string, end as string);
      res.status(200).json({ data: "Events deleted successfully", error: null });
    } catch (error: any) {
      logger.error(`Delete Events Range Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to delete events") });
    }
  }

  static async copy(req: Request, res: Response) {
    try {
      const userId = await EventController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const newEvents = await EventService.copyEvents(userId, req.body);
      res.status(201).json({ data: newEvents, error: null });
    } catch (error: any) {
      logger.error(`Copy Events Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to copy events") });
    }
  }
}
