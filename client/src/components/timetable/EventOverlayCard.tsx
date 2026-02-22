import React from "react";
import { motion } from "framer-motion";
import { format, startOfDay, differenceInMinutes } from "date-fns";
import { Clock, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { Event } from "../../types";

interface EventOverlayCardProps {
  event: Event;
  selectedDate: Date;
  onClick: (event: Event) => void;
}

const PIXELS_PER_MINUTE = 80 / 60;

const EventOverlayCard: React.FC<EventOverlayCardProps> = ({
  event,
  selectedDate,
  onClick,
}) => {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const startOfDayDate = startOfDay(selectedDate);

  let startMinutes = differenceInMinutes(startTime, startOfDayDate);
  if (startMinutes < 0) startMinutes = 0;

  let endMinutes = differenceInMinutes(endTime, startOfDayDate);
  if (endMinutes > 1440) endMinutes = 1440;

  const durationMinutes = endMinutes - startMinutes;
  const top = startMinutes * PIXELS_PER_MINUTE;
  const height = durationMinutes * PIXELS_PER_MINUTE;

  if (durationMinutes <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        absolute left-2 right-4 rounded-xl border-l-[6px] shadow-sm backdrop-blur-sm pointer-events-auto cursor-pointer
        flex flex-col overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all z-20 group
        ${
          event.isCompleted
            ? "bg-success/20 border-success text-success shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-success/20"
            : event.skippedReason
              ? "bg-warning/15 border-warning opacity-90"
              : event.isSpecial
                ? "bg-gradient-to-r from-accent/20 to-purple-500/10 border-accent text-accent-foreground shadow-accent/5"
                : "bg-card/90 border-border text-card-foreground shadow-sm"
        }
      `}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 40)}px`,
      }}
      onClick={() => onClick(event)}
    >
      <div className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm leading-tight truncate">
                {event.title}
              </h3>
              {event.isSpecial && !event.isCompleted && (
                <Sparkles className="h-3 w-3 text-accent animate-pulse" />
              )}
            </div>
            {height > 50 && (
              <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-relaxed">
                {event.description || "No description"}
              </p>
            )}
          </div>

          <div className="shrink-0 flex gap-1">
            {event.isCompleted && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            {event.skippedReason && (
              <XCircle className="h-4 w-4 text-warning" />
            )}
          </div>
        </div>

        {height > 30 && (
          <div className="flex items-center gap-1.5 mt-auto pt-2 text-[10px] font-medium uppercase tracking-wide opacity-80">
            <Clock className="h-3 w-3" />
            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50" />
    </motion.div>
  );
};

export default EventOverlayCard;
