import React from "react";
import Badge from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import { Goal } from "../../types";
import {
  calculateGoalProgress,
  calculateGoalTimeMetrics,
  calculateGoalStatus,
} from "../../utils/goal.utils";

interface GoalAnalysisItemProps {
  goal: Goal;
}

const GoalAnalysisItem: React.FC<GoalAnalysisItemProps> = ({ goal }) => {
  const totalSteps = goal.steps.length;
  const completedSteps = goal.steps.filter((s) => s.isCompleted).length;
  const progress = calculateGoalProgress(goal);
  const { remainingDays } = calculateGoalTimeMetrics(goal);
  const { status, variant } = calculateGoalStatus(goal);

  return (
    <div className="p-4 border border-border rounded-lg bg-secondary/10">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg leading-tight">{goal.title}</h4>
          <p className="text-xs text-foreground/60 mt-1">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
        <Badge variant={variant}>{status}</Badge>
      </div>

      <ProgressBar
        progress={progress}
        showPercent={false}
        className="mb-2"
        barClassName="bg-accent"
      />

      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/40">
        <span>
          {remainingDays > 0 ? `${remainingDays} days left` : "Deadline passed"}
        </span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};

export default GoalAnalysisItem;
