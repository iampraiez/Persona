import React from "react";
import { format, isSameDay } from "date-fns";
import { Event } from "../../types";

interface WeekSelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  weekDays: Date[];
  events?: Event[];
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  weekDays,
  events,
}) => {
  return (
    <div className="grid grid-cols-7 gap-2 mb-6">
      {weekDays.map((day, index) => {
        const isSelectedDay = isSameDay(day, selectedDate);
        const hasEvents = events?.some((event) =>
          isSameDay(new Date(event.startTime), day),
        );

        return (
          <button
            key={index}
            className={`p-2 rounded-md flex flex-col items-center transition-all ${
              isSelectedDay
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 scale-105"
                : "bg-secondary hover:bg-secondary/80 text-foreground/70"
            }`}
            onClick={() => setSelectedDate(day)}
          >
            <span className="text-xs font-semibold uppercase opacity-60">
              {format(day, "EEE")}
            </span>
            <span className="text-lg font-bold">{format(day, "d")}</span>
            {hasEvents && !isSelectedDay && (
              <span className="h-1.5 w-1.5 bg-accent rounded-full mt-1"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WeekSelector;
