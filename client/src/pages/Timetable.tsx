import { useRef, useEffect } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { useUser } from "../hooks/useUser";
import { useEvents } from "../hooks/useEvents";
import {
  Calendar,
  Plus,
  MoreVertical,
  Sparkles,
  Copy,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Sub-components
import WeekSelector from "../components/timetable/WeekSelector";
import TimelineGrid from "../components/timetable/TimelineGrid";
import EventOverlayCard from "../components/timetable/EventOverlayCard";
import NewEventModal from "../components/timetable/NewEventModal";
import EventDetailsModal from "../components/timetable/EventDetailsModal";
import AiGenerateModal from "../components/timetable/AiGenerateModal";
import { CopyModal, ClearModal } from "../components/timetable/ActionModals";
import { format } from "date-fns";

const Timetable = () => {
  const { data: user } = useUser();
  const {
    selectedDate,
    setSelectedDate,
    weekDays,
    eventsForSelectedDate,
    navigateWeek,
    isLoading,
    
    // Modal Visibility
    showNewEventModal,
    setShowNewEventModal,
    showEventDetailsModal,
    setShowEventDetailsModal,
    showAiModal,
    setShowAiModal,
    showCopyModal,
    setShowCopyModal,
    showClearModal,
    setShowClearModal,
    
    // UI State
    isMenuOpen,
    setIsMenuOpen,
    
    // Data State
    newEvent,
    setNewEvent,
    selectedEvent,
    aiRange,
    setAiRange,
    copyRange,
    setCopyRange,
    clearRange,
    setClearRange,
    copyTargetStart,
    setCopyTargetStart,
    
    // Handlers
    onNewEventSubmit,
    handleEventClick,
    onMarkAsCompleted,
    onSkipEvent,
    onDeleteClick,
    handleDuplicateEvent,
    handleAiGenerate,
    handleCopyRange,
    handleClearRange,
    handleUpdateEvent,
    
    // Loading States
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    isCopying,
    isClearing,
  } = useTimetable();

  const { events } = useEvents();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsMenuOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <WeekSelector 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            weekDays={weekDays}
            navigateWeek={navigateWeek}
            events={events || undefined}
          />
        </div>
        
        <div className="flex gap-2 relative h-fit mt-12" ref={menuRef}>
          <button
            className="btn btn-accent flex items-center gap-2 shadow-lg shadow-accent/20"
            onClick={() => setShowNewEventModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">New Event</span>
          </button>

          <button
            className="p-2 rounded-full hover:bg-secondary border border-border transition-colors"
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

      {/* Time grid Container */}
      <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Calendar className="h-6 w-6 text-accent" />
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {format(selectedDate, "EEEE, MMMM d")}
            </span>
          </h2>
        </div>

        <div className="relative min-h-[1920px] ml-2">
          <TimelineGrid 
            onSlotClick={(hour) => {
              const date = new Date(selectedDate);
              date.setHours(hour, 0, 0, 0);
              setNewEvent({
                title: "",
                description: "",
                startTime: format(date, "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(date.getTime() + 3600000), "yyyy-MM-dd'T'HH:mm"),
                notifyBefore: user?.defaultNotifyBefore || 15,
              });
              setShowNewEventModal(true);
            }} 
          />

          <div className="absolute top-0 left-16 right-0 bottom-0 z-10 pointer-events-none">
            {eventsForSelectedDate?.map((event) => (
              <EventOverlayCard 
                key={event.id}
                event={event}
                selectedDate={selectedDate}
                onClick={handleEventClick}
              />
            ))}

            {(!eventsForSelectedDate || eventsForSelectedDate.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-20">
                <div className="text-center">
                  <Calendar className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-bold text-xl">No events today</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewEventModal 
        isOpen={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onSubmit={onNewEventSubmit}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        isCreating={isCreating}
      />

      <EventDetailsModal 
        isOpen={showEventDetailsModal}
        onClose={() => setShowEventDetailsModal(false)}
        event={selectedEvent}
        onMarkAsCompleted={onMarkAsCompleted}
        onSkipEvent={onSkipEvent}
        onDelete={onDeleteClick}
        onDuplicate={handleDuplicateEvent}
        onUpdate={handleUpdateEvent}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <AiGenerateModal 
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onGenerate={handleAiGenerate}
        aiRange={aiRange}
        setAiRange={setAiRange}
        isGenerating={isGenerating}
        aiCredits={user?.aiCredits ?? 0}
      />

      <CopyModal 
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onCopy={handleCopyRange}
        range={copyRange}
        setRange={setCopyRange}
        targetStart={copyTargetStart}
        setTargetStart={setCopyTargetStart}
        isCopying={isCopying}
      />

      <ClearModal 
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onClear={handleClearRange}
        range={clearRange}
        setRange={setClearRange}
        isClearing={isClearing}
      />
    </div>
  );
};

export default Timetable;
