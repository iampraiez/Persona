import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, differenceInMinutes, startOfDay } from "date-fns";
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
  Target,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { useTimetable } from "../hooks/useTimetable";
import { useUser } from "../hooks/useUser";
import { useEvents } from "../hooks/useEvents";
import { Event } from "../types";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const Timetable = () => {
  const { data: user } = useUser();
  const {
    selectedDate, setSelectedDate,
    weekDays,
    eventsForSelectedDate,
    navigateWeek,
    isLoading,
    showNewEventModal, setShowNewEventModal,
    showEventDetailsModal, setShowEventDetailsModal,
    showAiModal, setShowAiModal,
    showCopyModal, setShowCopyModal,
    showClearModal, setShowClearModal,
    isMenuOpen, setIsMenuOpen,
    aiRange, setAiRange,
    copyRange, setCopyRange,
    clearRange, setClearRange,
    copyTargetStart, setCopyTargetStart,
    handleCreateEvent,
    handleUpdateEvent,
    handleSkipEvent,
    handleDeleteEvent,
    handleAiGenerate,
    handleCopyRange,
    handleClearRange,
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    isCopying,
    isClearing,
  } = useTimetable();

  const { events } = useEvents();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    notifyBefore: user?.defaultNotifyBefore || 15,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [skipps, setSkipps] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [important, setImportant] = useState<boolean>(false);
  const [aiDescription, setAiDescription] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsMenuOpen]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const onNewEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error("Please fill out all fields");
      return;
    }
    
    await handleCreateEvent({
      ...newEvent,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: new Date(newEvent.endTime).toISOString(),
    });

    setNewEvent({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      notifyBefore: user?.defaultNotifyBefore || 15,
    });
  };

  const onMarkAsCompleted = () => {
    if (!selectedEvent) return;
    handleUpdateEvent(selectedEvent.id, { isCompleted: true });
    setSelectedEvent(null);
    // toast.success("Completed");
  };

  const onSkipEvent = () => {
    if (!selectedEvent) return;
    handleSkipEvent(selectedEvent.id, {
      skippedIsImportant: important,
      skippedReason: skipps,
    });
    setSkipps("");
    setSelectedEvent(null);
    // toast.success("Skipped");
  };

  const onDeleteClick = () => {
    if (!selectedEvent) return;
    if (confirm("Delete this event?")) {
      handleDeleteEvent(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const handleDuplicateEvent = () => {
    if (!selectedEvent) return;
    setNewEvent({
      title: `${selectedEvent.title} (Copy)`,
      description: selectedEvent.description || "",
      startTime: format(new Date(selectedEvent.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(selectedEvent.endTime), "yyyy-MM-dd'T'HH:mm"),
      notifyBefore: selectedEvent.notifyBefore,
    });
    setShowEventDetailsModal(false);
    setShowNewEventModal(true);
  };

  
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
        <div>
           <h1 className="text-2xl font-bold">Weekly Timetable</h1>
           <div className="flex items-center gap-2 mt-1">
             <button onClick={() => navigateWeek('prev')} className="p-1 hover:bg-secondary rounded-full"><ChevronLeft className="h-4 w-4" /></button>
             <p className="text-foreground/70 text-sm">{format(weekDays[0], "MMM d")} - {format(weekDays[6], "yyyy")}</p>
             <button onClick={() => navigateWeek('next')} className="p-1 hover:bg-secondary rounded-full"><ChevronRight className="h-4 w-4" /></button>
           </div>
        </div>
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
          {/* Timeline Container */}
          <div className="relative min-h-[1920px]" style={{ height: '1920px' }}>
            
            {/* Background Grid & Time Labels */}
            <div className="absolute inset-0 z-0">
               {[...Array(24)].map((_, hour) => (
                <div 
                  key={`grid-${hour}`} 
                  className="group flex h-20 border-b border-border/40 hover:bg-accent/[0.02] transition-colors"
                >
                  {/* Time Label */}
                  <div className="w-16 text-[10px] md:text-xs text-foreground/40 pt-2 pr-4 text-right font-medium shrink-0 select-none">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </div>
                  
                  {/* Hour Slot Click Target */}
                  <div 
                    className="flex-1 relative cursor-pointer border-l border-border/40"
                    onClick={() => {
                       const date = new Date(selectedDate);
                       date.setHours(hour, 0, 0, 0);
                       setNewEvent(prev => ({ 
                         ...prev, 
                         startTime: format(date, "yyyy-MM-dd'T'HH:mm"),
                         endTime: format(new Date(date.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
                       }));
                       setShowNewEventModal(true);
                    }}
                  >
                     <div className="opacity-0 group-hover:opacity-100 absolute left-4 top-1/2 -translate-y-1/2 text-xs text-accent font-medium flex items-center gap-1 transition-opacity">
                        <Plus className="h-3 w-3" /> Add Event
                     </div>
                  </div>
                </div>
               ))}
            </div>

            {/* Events Layer */}
            <div className="absolute top-0 left-16 right-0 bottom-0 z-10 pointer-events-none">
              {eventsForSelectedDate?.map((event) => {
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                
                // Calculate position relative to the day (00:00 - 23:59)
                const startOfDayDate = startOfDay(selectedDate);
                
                // Get offset in minutes from start of day
                let startMinutes = differenceInMinutes(startTime, startOfDayDate);
                // Handle events starting previous day
                if (startMinutes < 0) startMinutes = 0;

                let endMinutes = differenceInMinutes(endTime, startOfDayDate);
                // Handle events ending next day
                if (endMinutes > 1440) endMinutes = 1440;

                const durationMinutes = endMinutes - startMinutes;
                
                // 80px per hour = 1.3333px per minute
                const PIXELS_PER_MINUTE = 80 / 60;
                const top = startMinutes * PIXELS_PER_MINUTE;
                const height = durationMinutes * PIXELS_PER_MINUTE;
                
                // Skip if duration is invalid or 0
                if (durationMinutes <= 0) return null;

                const isSpecial = event.isSpecial;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`
                      absolute left-2 right-4 rounded-xl border-l-[6px] shadow-sm backdrop-blur-sm pointer-events-auto cursor-pointer
                      flex flex-col overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all z-20 group
                      ${
                        event.isCompleted
                          ? "bg-success/20 border-success shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-success/20"
                          : event.skippedReason
                            ? "bg-warning/15 border-warning opacity-90"
                            : isSpecial
                              ? "bg-gradient-to-r from-accent/20 to-purple-500/10 border-accent text-accent-foreground shadow-accent/5"
                              : "bg-card/90 border-border text-card-foreground shadow-sm"
                      }
                    `}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 40)}px`, // Minimum height for visibility
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="p-3 flex flex-col h-full justify-between">
                       {/* Header: Title & Icons */}
                       <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-sm leading-tight truncate">
                                  {event.title}
                                </h3>
                                {isSpecial && !event.isCompleted && (
                                  <Sparkles className="h-3 w-3 text-accent animate-pulse" />
                                )}
                             </div>
                             {(height > 50) && (
                               <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-relaxed">
                                  {event.description || "No description"}
                               </p>
                             )}
                          </div>
                      
                          <div className="shrink-0 flex gap-1">
                             {event.isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                             {event.skippedReason && <XCircle className="h-4 w-4 text-warning" />}
                          </div>
                       </div>

                       {/* Footer: Time */}
                       {(height > 30) && (
                         <div className={`flex items-center gap-1.5 mt-auto pt-2 text-[10px] font-medium uppercase tracking-wide opacity-80`}>
                            <Clock className="h-3 w-3" />
                            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                         </div>
                       )}
                    </div>
                    
                    {/* Decorative Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50" />
                  </motion.div>
                );
              })}
              
              {(!eventsForSelectedDate || eventsForSelectedDate.length === 0) && (
                 <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                     <div className="text-center opacity-30">
                        <Calendar className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-lg">No events today</p>
                     </div>
                 </div>
              )}
            </div>
          </div>

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
                  className="btn btn-accent flex items-center gap-2"
                  onClick={(e) => onNewEventSubmit(e)}
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Event"}
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
                  setImportant(false);
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

              <div className="border-t border-border pt-6 space-y-6">
                {/* Status Indicator for Completed/Skipped */}
                {(selectedEvent.isCompleted || selectedEvent.skippedReason) && (
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${selectedEvent.isCompleted ? 'bg-success/5 border-success/20 text-success' : 'bg-warning/5 border-warning/20 text-warning'}`}>
                     {selectedEvent.isCompleted ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                     <span className="text-sm font-bold uppercase tracking-wider">
                       {selectedEvent.isCompleted ? "Completed" : "Skipped"}
                     </span>
                  </div>
                )}

                {/* Main Action: Focus Session */}
                {!selectedEvent.isCompleted && !selectedEvent.skippedReason && (
                  <button
                    onClick={() => navigate(`/focus/${selectedEvent.id}`)}
                    className="w-full btn bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 flex items-center justify-center gap-2 py-3 transition-all active:scale-95 group"
                  >
                    <Target className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Start Focus Session</span>
                  </button>
                )}

                {/* Secondary Action Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (selectedEvent.isCompleted || selectedEvent.skippedReason) {
                        handleUpdateEvent(selectedEvent.id, { isCompleted: false, skippedReason: undefined });
                      } else {
                        onMarkAsCompleted();
                      }
                    }}
                    disabled={isUpdating}
                    className={`btn flex items-center justify-center gap-2 py-3 border transition-all active:scale-95 ${
                      selectedEvent.isCompleted ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                    }`}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedEvent.isCompleted ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    <span className="font-bold">{selectedEvent.isCompleted ? 'Reset' : 'Complete'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedEvent.skippedReason) {
                        handleUpdateEvent(selectedEvent.id, { isCompleted: false, skippedReason: undefined });
                      } else {
                        if (show) setImportant(false);
                        setShow(!show);
                      }
                    }}
                    disabled={isUpdating}
                    className={`btn flex items-center justify-center gap-2 py-3 border transition-all active:scale-95 ${
                      selectedEvent.skippedReason ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
                    }`}
                  >
                    <RotateCcw className={`h-4 w-4 ${selectedEvent.skippedReason ? '' : 'hidden'}`} />
                    {!selectedEvent.skippedReason && <Clock className="h-4 w-4" />}
                    <span className="font-bold">{selectedEvent.skippedReason ? 'Reset' : 'Skip'}</span>
                  </button>

                  <button
                    onClick={handleDuplicateEvent}
                    className="btn bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 py-3 border border-border/50"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="font-bold">Duplicate</span>
                  </button>

                  <button
                    onClick={onDeleteClick}
                    disabled={isDeleting}
                    className="btn bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-2 py-3 border border-destructive/20"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="font-bold">Delete</span>
                  </button>
                </div>
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
                   <div className="flex justify-center">
                    <button
                      onClick={() => setImportant(!important)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border transition duration-200 
                   ${
                     important
                       ? "bg-warning text-white border-warning hover:bg-warning/90"
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
                    onClick={onSkipEvent}
                    disabled={isUpdating}
                    className="flex-1 btn bg-warning/20 text-warning hover:bg-warning/30 flex items-center justify-center gap-2"
                  >
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Skip
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
                  onClick={() => handleAiGenerate(aiDescription)}
                  disabled={isGenerating}
                  className="btn btn-accent flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate"}
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
                  disabled={isCopying}
                  className="btn btn-accent flex items-center gap-2"
                >
                  {isCopying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCopying ? "Copying..." : "Copy Events"}
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
                  disabled={isClearing}
                  className="btn bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-2"
                >
                  {isClearing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isClearing ? "Clearing..." : "Clear All"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
