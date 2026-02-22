import React from "react";
import Badge from "../ui/Badge";
import ProgressBar from "../ui/ProgressBar";
import { Goal } from "../../types";

interface GoalAnalysisItemProps {
  goal: Goal;
}

const GoalAnalysisItem: React.FC<GoalAnalysisItemProps> = ({ goal }) => {
  const totalSteps = goal.steps.length;
  const completedSteps = goal.steps.filter((s) => s.isCompleted).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const createdAt = new Date(goal.createdAt);
  const deadline = new Date(createdAt.getTime() + goal.totalDays * 24 * 60 * 60 * 1000);
  const daysLeft = Math.max(
    0,
    Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  let status: "On Track" | "Behind" | "Overdue" | "Completed" = "On Track";
  let statusVariant: "success" | "warning" | "destructive" | "accent" = "success";

  if (progress < 50 && daysLeft < goal.totalDays / 2) {
    status = "Behind";
    statusVariant = "warning";
  }
  if (daysLeft === 0 && progress < 100) {
    status = "Overdue";
    statusVariant = "destructive";
  }
  if (progress === 100) {
    status = "Completed";
    statusVariant = "success";
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-secondary/10">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg">{goal.title}</h4>
          <p className="text-xs text-foreground/60">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>

      <ProgressBar 
        progress={progress} 
        showPercent={false}
        className="mb-2"
        barClassName="bg-accent"
      />

      <div className="flex justify-between text-xs text-foreground/70">
        <span>{daysLeft} days left</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};

export default GoalAnalysisItem;
