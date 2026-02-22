import React from "react";
import { Goal } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, ChevronRight, Target } from "lucide-react";
import GoalStepItem from "./GoalStepItem";
import GoalOptionsMenu from "./GoalOptionsMenu";
import {
  calculateGoalProgress,
  calculateGoalTimeMetrics,
  sortStepsByTitleNumber,
} from "../../utils/goal.utils";

interface GoalCardProps {
  goal: Goal;
  isExpanded: boolean;
  isOptionsOpen: boolean;
  onToggleExpand: () => void;
  onToggleOptions: () => void;
  onReset: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCompleteStep: (stepId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingStep: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isExpanded,
  isOptionsOpen,
  onToggleExpand,
  onToggleOptions,
  onReset,
  onEdit,
  onDelete,
  onCompleteStep,
  isUpdating,
  isDeleting,
  isUpdatingStep,
}) => {
  const progressPercentage = calculateGoalProgress(goal);
  const { remainingDays, timePercentage } = calculateGoalTimeMetrics(goal);
  const steps = goal.steps || [];
  const completedSteps = steps.filter((step) => step.isCompleted).length;

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border/50 hover:border-accent/30 transition-all group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{goal.title}</h2>
              <p className="text-sm text-foreground/60 mt-1 line-clamp-1">
                {goal.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold">
              {progressPercentage}%
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOptions();
                }}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-foreground/40" />
              </button>
              <GoalOptionsMenu
                isOpen={isOptionsOpen}
                onClose={onToggleOptions}
                onReset={onReset}
                onEdit={onEdit}
                onDelete={onDelete}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-foreground/40">
              <span>Goal Progress</span>
              <span>
                {completedSteps}/{steps.length} Steps
              </span>
            </div>
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-accent"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-foreground/40">
              <span>Timeline</span>
              <span>
                {remainingDays > 0
                  ? `${remainingDays}d left`
                  : "Deadline passed"}
              </span>
            </div>
            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${timePercentage}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={`h-full ${
                  timePercentage > 85
                    ? "bg-destructive"
                    : timePercentage > 60
                      ? "bg-warning"
                      : "bg-success"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold bg-secondary/50 hover:bg-secondary rounded-xl transition-all"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Hide Roadmap" : "View Roadmap"}
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-300 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-secondary/20 overflow-hidden"
          >
            <div className="p-6 space-y-3">
              {steps.length > 0 ? (
                sortStepsByTitleNumber(steps).map((step, idx) => (
                  <GoalStepItem
                    key={step.id}
                    step={step}
                    index={idx}
                    onComplete={onCompleteStep}
                    isUpdating={isUpdatingStep}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-foreground/40">
                    No steps defined for this goal.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GoalCard;
