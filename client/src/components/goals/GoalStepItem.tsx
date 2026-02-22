import React from "react";
import { Step } from "../../types";
import { Check, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface GoalStepItemProps {
  step: Step;
  index: number;
  onComplete: (stepId: string) => void;
  isUpdating: boolean;
}

const GoalStepItem: React.FC<GoalStepItemProps> = ({
  step,
  index,
  onComplete,
  isUpdating,
}) => {
  return (
    <div
      className={`p-3 rounded-md flex items-start gap-4 transition-colors ${
        step.isCompleted ? "bg-success/10" : "bg-secondary"
      }`}
    >
      <motion.div
        className="flex-shrink-0 mt-0.5"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {step.isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
          >
            <Check className="h-3 w-3 text-success-foreground" />
          </motion.div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        )}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4
              className={`font-medium text-sm md:text-base leading-tight truncate ${
                step.isCompleted ? "line-through opacity-50" : ""
              }`}
            >
              {step.title}
            </h4>
            {step.description && (
              <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                {step.description}
              </p>
            )}
          </div>
          <div className="flex items-center text-[10px] md:text-xs text-foreground/50 shrink-0 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(new Date(step.dueDate), "MMM d")}</span>
          </div>
        </div>
        {!step.isCompleted && (
          <div className="mt-2 text-right">
            <button
              onClick={() => onComplete(step.id)}
              disabled={isUpdating}
              className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              {isUpdating ? "Updating..." : "Mark Complete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalStepItem;
