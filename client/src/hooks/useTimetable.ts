import { useState, useMemo, useCallback } from "react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  parseISO, 
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  setHours,
  areIntervalsOverlapping
} from "date-fns";
import { useEvents } from "./useEvents";
import { Event } from "../types";
import { useAuthStore } from "../store/auth.store";
import { demoApi } from "../service/demo.service";
import { api } from "../service/api.service";
import { toast } from "react-toastify";

export const useTimetable = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { 
    events, 
    isLoading, 
    createEvent: createEventRaw,
    updateEvent: updateEventRaw,
    deleteEvent: deleteEventRaw,
    isCreating,
    isUpdating,
    isDeleting
  } = useEvents();
  const { isDemo } = useAuthStore();

  const getApi = useCallback(() => (isDemo ? demoApi : api), [isDemo]);

  // Week generation
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return [...Array(7)].map((_, i) => addDays(start, i));
  }, [selectedDate]);

  // Filtering for current view - filter events that OVERLAP with the selected day
  const eventsForSelectedDate = useMemo(() => {
    if (!events) return [];
    
    // Day range
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    return events.filter((event) => {
      const eventStart = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime;
      const eventEnd = typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime;
      
      // Check for overlapping intervals
      // Two intervals overlap if (StartA < EndB) and (EndA > StartB)
      return isBefore(eventStart, dayEnd) && isAfter(eventEnd, dayStart);
    });
  }, [events, selectedDate]);

  // Group events by hour (for the multi-hour view logic)
  const getEventsForHour = useCallback((hour: number) => {
     // Create a date object for this specific hour slot
    const slotStart = setHours(startOfDay(selectedDate), hour);
    const slotEnd = setHours(startOfDay(selectedDate), hour + 1);

    return eventsForSelectedDate.filter((event) => {
      const eventStart = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime;
      const eventEnd = typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime;

      // Special handling for events ending exactly on the hour boundary
      // An event 2-3pm should NOT show up in the 3-4pm slot.
      // So overlapping check: eventStart < slotEnd && eventEnd > slotStart
      // AND ensuring we respect the boundary exclusivity for end time
      
      return areIntervalsOverlapping(
        { start: eventStart, end: eventEnd },
        { start: slotStart, end: slotEnd },
        { inclusive: false } // Determines if strict inequality is used. Default is false, which is what we generally want for end-exclusion
      ); 
    });
  }, [eventsForSelectedDate, selectedDate]);

  // Modal & Menu States
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Range States
  const [aiRange, setAiRange] = useState({ start: format(selectedDate, "yyyy-MM-dd"), end: format(selectedDate, "yyyy-MM-dd") });
  const [copyRange, setCopyRange] = useState({ start: format(selectedDate, "yyyy-MM-dd"), end: format(selectedDate, "yyyy-MM-dd") });
  const [clearRange, setClearRange] = useState({ start: format(selectedDate, "yyyy-MM-dd"), end: format(selectedDate, "yyyy-MM-dd") });
  const [copyTargetStart, setCopyTargetStart] = useState(format(selectedDate, "yyyy-MM-dd"));

  const handleCreateEvent = async (eventData: Partial<Event>) => {
    return new Promise((resolve, reject) => {
      createEventRaw(eventData, {
        onSuccess: (data) => {
          toast.success("Event created successfully");
          setShowNewEventModal(false);
          resolve(data);
        },
        onError: (err) => {
          toast.error("Failed to create event");
          reject(err);
        }
      });
    });
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<Event>) => {
    return new Promise((resolve, reject) => {
      updateEventRaw({ id, event: eventData }, {
        onSuccess: (data) => {
          setShowEventDetailsModal(false);
          resolve(data);
        },
        onError: (err) => {
          reject(err);
        }
      });
    });
  };

  const handleDeleteEvent = async (id: string) => {
    return new Promise((resolve, reject) => {
      deleteEventRaw(id, {
        onSuccess: () => {
          toast.success("Event deleted");
          setShowEventDetailsModal(false);
          resolve(null);
        },
        onError: (err) => {
          toast.error("Failed to delete event");
          reject(err);
        }
      });
    });
  };

  const handleAiGenerate = async (description: string) => {
    try {
      const start = new Date(aiRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(aiRange.end);
      end.setHours(23, 59, 59, 999);

      await getApi().generateTimetable(description, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      toast.success("Schedule generated");
      setShowAiModal(false);
      window.location.reload();
    } catch {
      toast.error("Generation failed");
    }
  };

  const handleCopyRange = async () => {
    try {
      const sStart = new Date(copyRange.start);
      sStart.setHours(0, 0, 0, 0);
      const sEnd = new Date(copyRange.end);
      sEnd.setHours(23, 59, 59, 999);
      const tStart = new Date(copyTargetStart);
      tStart.setHours(0, 0, 0, 0);

      await getApi().copyEvents(
        sStart.toISOString(),
        sEnd.toISOString(),
        tStart.toISOString()
      );
      toast.success("Events copied successfully");
      setShowCopyModal(false);
      window.location.reload();
    } catch {
      toast.error("Failed to copy events");
    }
  };

  const handleClearRange = async () => {
    try {
      const start = new Date(clearRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(clearRange.end);
      end.setHours(23, 59, 59, 999);

      await getApi().deleteEventsRange(start.toISOString(), end.toISOString());
      toast.success("Events cleared successfully");
      setShowClearModal(false);
      window.location.reload();
    } catch {
      toast.error("Failed to clear events");
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    weekDays,
    eventsForSelectedDate,
    getEventsForHour,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Modals
    showNewEventModal, setShowNewEventModal,
    showEventDetailsModal, setShowEventDetailsModal,
    showAiModal, setShowAiModal,
    showCopyModal, setShowCopyModal,
    showClearModal, setShowClearModal,
    isMenuOpen, setIsMenuOpen,

    // Ranges
    aiRange, setAiRange,
    copyRange, setCopyRange,
    clearRange, setClearRange,
    copyTargetStart, setCopyTargetStart,

    // Actions
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleAiGenerate,
    handleCopyRange,
    handleClearRange,
  };
};
