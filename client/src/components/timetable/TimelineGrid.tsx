import React from "react";
import { Plus } from "lucide-react";

interface TimelineGridProps {
  onSlotClick: (hour: number) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ onSlotClick }) => {
  return (
    <div className="absolute inset-0 z-0">
      {[...Array(24)].map((_, hour) => (
        <div
          key={`grid-${hour}`}
          className="group flex h-20 border-b border-border/40 hover:bg-accent/[0.02] transition-colors"
        >
          {/* Time Label */}
          <div className="w-16 text-[10px] md:text-xs text-foreground/40 pt-2 pr-4 text-right font-medium shrink-0 select-none">
            {hour === 0
              ? "12 AM"
              : hour < 12
                ? `${hour} AM`
                : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`}
          </div>

          {/* Hour Slot Click Target */}
          <div
            className="flex-1 relative cursor-pointer border-l border-border/40"
            onClick={() => onSlotClick(hour)}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute left-4 top-1/2 -translate-y-1/2 text-xs text-accent font-medium flex items-center gap-1 transition-opacity">
              <Plus className="h-3 w-3" /> Add Event
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineGrid;
