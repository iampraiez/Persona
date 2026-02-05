import { prisma } from "../lib/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export class AnalyticsService {
  static async getAnalytics(userId: string, range: string, currentDate: Date) {
    let startDate: Date;
    let endDate: Date;

    // Determine date range
    switch (range) {
      case "day":
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        break;
      case "week":
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case "month":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case "year":
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
        break;
      case "all":
        startDate = new Date(0);
        endDate = new Date();
        break;
      default:
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    }

    const [events, goals] = await Promise.all([
      prisma.event.findMany({
        where: { userId, startTime: { gte: startDate, lte: endDate } },
        orderBy: { startTime: "asc" },
      }),
      prisma.goal.findMany({
        where: { userId },
        include: { steps: true },
      }),
    ]);

    const totalEvents = events.length;
    const completedEvents = events.filter((e) => e.isCompleted).length;
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
    
    const focusTime = events.reduce((acc, curr) => {
      if (curr.focusDuration && curr.focusDuration > 0) return acc + (curr.focusDuration / 3600);
      if (curr.startTime && curr.endTime && curr.isCompleted) {
        return acc + (new Date(curr.endTime).getTime() - new Date(curr.startTime).getTime()) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);

    const specialEvents = events.filter((e) => e.isSpecial);
    const skippedReasons = specialEvents.reduce((acc: Record<string, number>, curr) => {
      const reason = curr.skippedReason || "Unknown";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
    const specialEventsData = Object.entries(skippedReasons).map(([name, value]) => ({ name, value }));

    const activityData = this.prepareActivityData(range, events, currentDate);
    const goalProgressData = this.prepareGoalProgressData(goals, startDate, endDate);
    
    const averageGoalProgress = goalProgressData.length > 0 
        ? Math.round(goalProgressData.reduce((acc, curr) => acc + curr.progress, 0) / goalProgressData.length) 
        : 0;

    return {
      totalEvents,
      completedEvents,
      completionRate,
      focusTime: focusTime.toFixed(1),
      specialEventsCount: specialEvents.length,
      specialEventsData,
      activityData,
      goalProgressData,
      averageGoalProgress,
      range: { start: startDate, end: endDate }
    };
  }

  private static prepareActivityData(range: string, events: any[], currentDate: Date) {
    if (range === "day") {
        return Array.from({ length: 24 }, (_, h) => {
            const hourEvents = events.filter(e => new Date(e.startTime).getHours() === h);
            return { name: `${h}:00`, completed: hourEvents.filter(e => e.isCompleted).length, skipped: hourEvents.filter(e => e.isSpecial).length, total: hourEvents.length };
        });
    }
    if (range === "week") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days.map((day, index) => {
            const dayEvents = events.filter(e => new Date(e.startTime).getDay() === index);
            return { name: day, completed: dayEvents.filter(e => e.isCompleted).length, skipped: dayEvents.filter(e => e.isSpecial).length, total: dayEvents.length };
        });
    }
    if (range === "month") {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = events.filter(e => new Date(e.startTime).getDate() === day);
            return { name: `${day}`, completed: dayEvents.filter(e => e.isCompleted).length, skipped: dayEvents.filter(e => e.isSpecial).length, total: dayEvents.length };
        });
    }
    if (range === "year") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map((month, index) => {
            const monthEvents = events.filter(e => new Date(e.startTime).getMonth() === index);
            return { name: month, completed: monthEvents.filter(e => e.isCompleted).length, skipped: monthEvents.filter(e => e.isSpecial).length, total: monthEvents.length };
        });
    }
    const years = [...new Set(events.map(e => new Date(e.startTime).getFullYear()))].sort();
    return years.map(year => {
         const yearEvents = events.filter(e => new Date(e.startTime).getFullYear() === year);
         return { name: `${year}`, completed: yearEvents.filter(e => e.isCompleted).length, skipped: yearEvents.filter(e => e.isSpecial).length, total: yearEvents.length };
    });
  }

  private static prepareGoalProgressData(goals: any[], startDate: Date, endDate: Date) {
    return goals.map((goal) => {
      const completedStepsInRange = goal.steps.filter((s: any) => {
        if (!s.isCompleted || !s.completedAt) return false;
        const completedAt = new Date(s.completedAt);
        return completedAt >= startDate && completedAt <= endDate;
      }).length;
      return { id: goal.id, name: goal.title, progress: goal.steps.length > 0 ? Math.round((completedStepsInRange / goal.steps.length) * 100) : 0 };
    });
  }
}
