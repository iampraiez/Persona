import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Copy, X, Loader2, CheckCircle2 } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  isWithinInterval,
} from "date-fns";
import { toast } from "react-toastify";

interface CopyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CopyEventsModal: React.FC<CopyEventsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { events, createEventsBatch } = useEvents();
  const [isCopying, setIsCopying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleCopy = async () => {
    if (!events) return;

    setIsCopying(true);
    try {
      const now = new Date();
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });

      const lastWeekEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return isWithinInterval(eventDate, {
          start: lastWeekStart,
          end: lastWeekEnd,
        });
      });

      if (lastWeekEvents.length === 0) {
        toast.info("No events found from last week to copy.");
        onClose();
        return;
      }

      const newEvents = lastWeekEvents.map((event) => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        const newStartTime = addWeeks(startTime, 1);
        const newEndTime = addWeeks(endTime, 1);

        return {
          title: event.title,
          description: event.description,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          isSpecial: event.isSpecial,
          notifyBefore: event.notifyBefore,
        };
      });

      await createEventsBatch(newEvents);
      setIsDone(true);
      toast.success(
        `Successfully copied ${newEvents.length} events to this week!`
      );
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error copying events:", error);
      toast.error("Failed to copy events. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-accent/10 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                {!isCopying && !isDone && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-foreground/50" />
                  </button>
                )}
              </div>

              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {isDone ? "All Set!" : "New Week, Same Hustle?"}
                </h2>
                <p className="text-foreground/70">
                  {isDone
                    ? "Your schedule has been updated for the current week."
                    : "Would you like to copy all your events from last week to this week? It'll save you some time!"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {isDone ? (
                  <div className="flex items-center justify-center py-4 text-success gap-2">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">
                      Events Copied Successfully
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleCopy}
                      disabled={isCopying}
                      className="btn btn-accent w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
                    >
                      {isCopying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Copying Schedule...
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5" />
                          Yes, Copy My Schedule
                        </>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      disabled={isCopying}
                      className="btn bg-secondary hover:bg-secondary/80 w-full py-4 rounded-xl font-medium transition-colors"
                    >
                      No, I'll start fresh
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CopyEventsModal;
