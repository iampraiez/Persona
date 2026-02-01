import { useState, useRef, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import {
  Calendar,
  Clock,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Circle,
  Copy,
  Sparkles,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { api } from "../service/api.service";
import { motion, AnimatePresence } from "framer-motion";
import { Event } from "../types";
import { useEvents } from "../hooks/useEvents";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useUser } from "../hooks/useUser";

const Timetable = () => {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEvents();
  const { data: user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    notifyBefore: user?.defaultNotifyBefore || 15,
  });
  const [showNewEventModal, setShowNewEventModal] = useState<boolean>(false);
  const [showEventDetailsModal, setShowEventDetailsModal] =
    useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [skipps, setSkipps] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [important, setImportant] = useState<boolean>(false);

  // AI & Utility State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiRange, setAiRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyRange, setCopyRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [copyTargetStart, setCopyTargetStart] = useState<string>("");
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearRange, setClearRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default ranges to selected date
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setAiRange({ start: dateStr, end: dateStr });
    setCopyRange({ start: dateStr, end: dateStr });
    setClearRange({ start: dateStr, end: dateStr });
    setCopyTargetStart(dateStr);
  }, [selectedDate, showAiModal, showCopyModal, showClearModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i));

  const eventsForSelectedDate = events?.filter((event) =>
    isSameDay(new Date(event.startTime), selectedDate),
  );

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  async function handleNewEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error("Please fill out all fields");
      return;
    }

    createEvent(newEvent, {
      onSuccess: () => {
        setShowNewEventModal(false);
        setNewEvent({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          notifyBefore: user?.defaultNotifyBefore || 15,
        });
        toast.success("Event created successfully");
      },
      onError: () => {
        toast.error("Failed to create event");
      },
    });
  }

  async function handleMarkAsCompleted() {
    if (!selectedEvent) return;
    updateEvent(
      {
        id: selectedEvent.id,
        event: { isCompleted: true },
      },
      {
        onSuccess: () => {
          setShowEventDetailsModal(false);
          setSelectedEvent(null);
          toast.success("Event marked as completed");
        },
        onError: () => {
          toast.error("Failed to mark event as completed");
        },
      },
    );
  }

  async function handleSkipEvent() {
    setShow(false);
    if (!selectedEvent) return;

    updateEvent(
      {
        id: selectedEvent.id,
        event: {
          skippedIsImportant: important,
          skippedReason: skipps,
          isCompleted: false,
        },
      },
      {
        onSuccess: () => {
          setShowEventDetailsModal(false);
          setSkipps("");
          setSelectedEvent(null);
          toast.success("Event skipped");
        },
        onError: () => {
          toast.error("Failed to skip event");
        },
      },
    );
  }

  async function handleResetStatus() {
    if (!selectedEvent) return;

    updateEvent(
      {
        id: selectedEvent.id,
        event: {
          isCompleted: false,
          skippedIsImportant: false,
          skippedReason: "",
        },
      },
      {
        onSuccess: () => {
          setShowEventDetailsModal(false);
          toast.success("Event status reset");
        },
        onError: () => {
          toast.error("Failed to reset event status");
        },
      },
    );
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return;

    deleteEvent(selectedEvent.id, {
      onSuccess: () => {
        setShowEventDetailsModal(false);
        setSelectedEvent(null);
        toast.success("Event deleted");
      },
      onError: () => {
        toast.error("Failed to delete event");
      },
    });
  }

  const handleDuplicateEvent = () => {
    if (!selectedEvent) return;
    setNewEvent({
      title: `${selectedEvent.title} (Copy)`,
      description: selectedEvent.description || "",
      startTime: format(
        new Date(selectedEvent.startTime),
        "yyyy-MM-dd'T'HH:mm",
      ),
      endTime: format(new Date(selectedEvent.endTime), "yyyy-MM-dd'T'HH:mm"),
      notifyBefore: selectedEvent.notifyBefore,
    });
    setShowEventDetailsModal(false);
    setShowNewEventModal(true);
  };

  const handleAiGenerate = async () => {
    if (!aiDescription) {
      toast.error("Please describe your schedule");
      return;
    }
    if (!aiRange.start || !aiRange.end) {
       toast.error("Please select a date range");
       return;
    }

    try {
      setIsGeneratingAi(true);
      const start = new Date(aiRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(aiRange.end);
      end.setHours(23, 59, 59, 999);

      await api.generateTimetable(aiDescription, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      
      toast.success("Timetable generated successfully!");
      setShowAiModal(false);
      setAiDescription("");
      window.location.reload(); 
    } catch {
      toast.error("Failed to generate timetable. Check if you have credits.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyRange = async () => {
    try {
      if (!copyRange.start || !copyRange.end || !copyTargetStart) return;
      
      const sStart = new Date(copyRange.start);
      sStart.setHours(0, 0, 0, 0);
      const sEnd = new Date(copyRange.end);
      sEnd.setHours(23, 59, 59, 999);
      const tStart = new Date(copyTargetStart);
      tStart.setHours(0, 0, 0, 0);

      await api.copyEvents(
        sStart.toISOString(),
        sEnd.toISOString(),
        tStart.toISOString()
      );
      
      toast.success("Events copied successfully!");
      setShowCopyModal(false);
       window.location.reload();
    } catch {
       toast.error("Failed to copy events");
    }
  };

  const handleClearRange = async () => {
    if (!confirm("Are you sure you want to clear events in this range?"))
      return;

    try {
      const start = new Date(clearRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(clearRange.end);
      end.setHours(23, 59, 59, 999);

      await api.deleteEventsRange(start.toISOString(), end.toISOString());
      toast.success("Events cleared successfully");
      setShowClearModal(false);
      window.location.reload();
    } catch {
      toast.error("Failed to clear events");
    }
  };
  //Page begins
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Weekly Timetable</h1>
        <div className="flex gap-2 relative" ref={menuRef}>
          <button
            className="btn btn-accent flex items-center gap-2"
            onClick={() => setShowNewEventModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">New Event</span>
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-secondary border border-border"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-56 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
              >
                <div className="p-1">
                  <button
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => {
                      setShowAiModal(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-accent" />
                    AI Generate
                  </button>
                  <button
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => {
                      setShowCopyModal(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Events
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-destructive rounded-lg transition-colors"
                    onClick={() => {
                       setShowClearModal(true);
                       setIsMenuOpen(false);
                    }}
                  >
                     <Trash2 className="h-4 w-4" />
                    Clear Events
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Week days selector */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const isSelectedDay = isSameDay(day, selectedDate);
          const hasEvents = events?.some((event) =>
            isSameDay(new Date(event.startTime), day),
          );

          return (
            <button
              key={index}
              className={`p-2 rounded-md flex flex-col items-center ${
                isSelectedDay
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <span className="text-xs">{format(day, "EEE")}</span>
              <span className="text-lg font-medium">{format(day, "d")}</span>
              {hasEvents && !isSelectedDay && (
                <span className="h-1 w-1 bg-accent rounded-full mt-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            {format(selectedDate, "EEEE, MMMM d")}
          </h2>
        </div>

        <div className="space-y-1">
          {/* Time slots (24 hours) */}
          {[...Array(24)].map((_, hour) => {
            const hourEvents = eventsForSelectedDate?.filter((event) => {
              const eventHour = new Date(event.startTime).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex">
                <div className="w-16 text-xs text-foreground/70 pt-2 pr-4 text-right">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </div>
                <div className="flex-1 min-h-[60px] border-l border-border pl-4 relative">
                  {hourEvents && hourEvents.length > 0 ? (
                    hourEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`
                          p-2 mb-1 rounded-md cursor-pointer
                          ${
                            event.isCompleted
                              ? "bg-success/20 hover:bg-success/30"
                              : event.skippedReason
                                ? "bg-warning/20 hover:bg-warning/30"
                                : "bg-secondary hover:bg-secondary/80"
                          }
                        `}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{event.title}</h3>
                              {event.isSpecial && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium uppercase tracking-wider">
                                  Special
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-foreground/70 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(
                                new Date(event.startTime),
                                "h:mm a",
                              )} - {format(new Date(event.endTime), "h:mm a")}
                            </div>
                          </div>
                          {event.isCompleted && (
                            <span className="text-success">
                              <CheckCircle className="h-5 w-5" />
                            </span>
                          )}
                          {event.skippedReason && (
                            <span className="text-warning">
                              <XCircle className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div
                        className="w-full h-[1px] bg-border/50 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => setShowNewEventModal(true)}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {(!eventsForSelectedDate || eventsForSelectedDate.length === 0) && (
            <div className="mt-8 p-8 text-center bg-secondary/30 rounded-lg border border-dashed border-border">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground/70">
                No events scheduled
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                You have a clear schedule for{" "}
                {format(selectedDate, "EEEE, MMMM d")}.
              </p>
              <button
                onClick={() => setShowNewEventModal(true)}
                className="mt-4 text-sm bg-accent/10 text-accent px-4 py-2 rounded-md hover:bg-accent/20 transition-colors"
              >
                Add an event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Event Modal Creating newe events*/}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Event</h2>
              <button
                className="p-1 rounded-full hover:bg-secondary"
                onClick={() => (setShowNewEventModal(false), setShow(false))}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  className="input w-full h-24"
                  placeholder="Event description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notify Before (minutes)
                </label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="15"
                  min="0"
                  value={newEvent.notifyBefore}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      notifyBefore: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  className="btn bg-secondary hover:bg-secondary/90"
                  onClick={() => (setShowNewEventModal(false), setShow(false))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent disabled:opacity-50"
                  disabled={isCreating}
                  onClick={(e) => handleNewEvent(e)}
                >
                  {isCreating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Create Event"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Showing events details */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Event Details</h2>
              <button
                className="p-1 rounded-full hover:bg-secondary"
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSkipps("");
                  setShow(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="mt-2 text-foreground/80">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="flex items-center text-sm text-foreground/70">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {format(new Date(selectedEvent.startTime), "h:mm a")} -{" "}
                  {format(new Date(selectedEvent.endTime), "h:mm a")}
                </span>
              </div>

              <div className="border-t border-border pt-4 flex space-x-2">
                {!selectedEvent.isCompleted && !selectedEvent.skippedReason ? (
                  <>
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={isUpdating}
                      className="flex-1 btn bg-success/20 text-success hover:bg-success/30 disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "Mark as Completed"}
                    </button>
                    <button
                      onClick={() => setShow(true)}
                      disabled={isUpdating}
                      className="flex-1 btn bg-warning/20 text-warning hover:bg-warning/30 disabled:opacity-50"
                    >
                      Skip Event
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleResetStatus}
                    disabled={isUpdating}
                    className="flex-1 btn bg-secondary hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {isUpdating ? "Resetting..." : "Reset Status"}
                  </button>
                )}
              </div>
              {show && (
                <>
                  {" "}
                  <textarea
                    className="input w-full h-24"
                    placeholder="Reason for skipping (optional)"
                    value={skipps}
                    onChange={(e) => setSkipps(e.target.value)}
                  ></textarea>
                  <div>
                    <button
                      onClick={() => setImportant(!important)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border transition duration-200 
                  ${
                    important
                      ? "bg-warning text-warning-foreground border-warning hover:bg-warning/90"
                      : "border-warning text-warning hover:bg-warning/10"
                  }`}
                    >
                      {important ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {important ? "Marked Important" : "Mark as Important"}
                    </button>
                  </div>
                  <button
                    onClick={handleSkipEvent}
                    disabled={isUpdating}
                    className="flex-1 btn bg-warning/20 text-warning hover:bg-warning/30 disabled:opacity-50"
                  >
                    {isUpdating ? "Skipping..." : "Submit"}
                  </button>
                </>
              )}

              {selectedEvent.skippedReason && (
                <div className="bg-warning/10 p-3 rounded-md border border-warning/20">
                  <h4 className="text-sm font-medium">
                    Skipped - What I did instead:
                  </h4>
                  <p className="mt-1 text-sm">{selectedEvent.skippedReason}</p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="mr-2">Was it important?</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedEvent.skippedIsImportant
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {selectedEvent.skippedIsImportant ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="btn bg-destructive/20 text-destructive hover:bg-destructive/30 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={handleDuplicateEvent}
                  className="btn bg-accent/10 text-accent hover:bg-accent/20 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  className="btn bg-secondary hover:bg-secondary/90"
                  onClick={() => {
                    setShowEventDetailsModal(false);
                    setShow(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg w-full max-w-md border border-border m-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Generate with AI
              </h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 hover:bg-secondary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date"
                    className="input w-full"
                    value={aiRange.start}
                    onChange={(e) => setAiRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input 
                    type="date"
                    className="input w-full"
                    value={aiRange.end}
                    onChange={(e) => setAiRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Describe your ideal schedule
                </label>
                <textarea
                  className="input w-full h-32 resize-none"
                  placeholder="e.g., I want to wake up at 7am, exercise for an hour, work on coding until 5pm with a lunch break, then relax."
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="btn bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi}
                  className="btn btn-accent flex items-center gap-2"
                >
                  {isGeneratingAi ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg w-full max-w-md border border-border m-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Copy Events
              </h2>
              <button
                onClick={() => setShowCopyModal(false)}
                className="p-1 hover:bg-secondary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium mb-1">Source Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date"
                    className="input w-full"
                    value={copyRange.start}
                    onChange={(e) => setCopyRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input 
                    type="date"
                    className="input w-full"
                    value={copyRange.end}
                    onChange={(e) => setCopyRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium mb-1">Target Start Date</label>
                <input 
                  type="date"
                  className="input w-full"
                  value={copyTargetStart}
                  onChange={(e) => setCopyTargetStart(e.target.value)}
                />
                <p className="text-xs text-foreground/60 mt-1">Events will be copied starting from this date.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="btn bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyRange}
                  className="btn btn-accent"
                >
                  Copy Events
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg w-full max-w-md border border-border m-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Clear Events
              </h2>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 hover:bg-secondary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-foreground/80">
                Select the range of events you want to delete. This action cannot be undone.
              </p>
               <div>
                <label className="block text-sm font-medium mb-1">Range to Clear</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date"
                    className="input w-full"
                    value={clearRange.start}
                    onChange={(e) => setClearRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input 
                    type="date"
                    className="input w-full"
                    value={clearRange.end}
                    onChange={(e) => setClearRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="btn bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearRange}
                  className="btn bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};;

export default Timetable;
