import { differenceInDays } from "date-fns";
import { Goal, Step } from "../types";

/**
 * Calculates the progress percentage of a goal based on completed steps.
 */
export const calculateGoalProgress = (goal: Goal): number => {
  const steps = goal.steps || [];
  if (steps.length === 0) return 0;

  const completedSteps = steps.filter((step) => step.isCompleted).length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Calculates the time elapsed and remaining for a goal.
 */
export const calculateGoalTimeMetrics = (goal: Goal) => {
  const elapsedDays = differenceInDays(new Date(), new Date(goal.createdAt));
  const totalDays = goal.totalDays || 1;
  const remainingDays = totalDays - elapsedDays;
  const timePercentage = Math.min(
    100,
    Math.round((elapsedDays / totalDays) * 100),
  );

  return {
    elapsedDays,
    remainingDays,
    timePercentage,
    isOverdue: remainingDays < 0,
  };
};

/**
 * Sorts steps by numeric values found in their titles (e.g., "Step 1", "Step 10").
 */
export const sortStepsByTitleNumber = (steps: Step[]): Step[] => {
  return [...steps].sort((a, b) => {
    const getNumber = (title: string) => {
      const match = title.match(/\d+/);
      return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
    };
    return getNumber(a.title) - getNumber(b.title);
  });
};

/**
 * Determines the status and visual variant of a goal.
 */
export const calculateGoalStatus = (goal: Goal) => {
  const progress = calculateGoalProgress(goal);
  const { remainingDays } = calculateGoalTimeMetrics(goal);

  if (progress === 100)
    return { status: "Completed", variant: "success" as const };
  if (remainingDays <= 0)
    return { status: "Overdue", variant: "destructive" as const };

  if (progress < 50 && remainingDays < (goal.totalDays || 1) / 2) {
    return { status: "Behind", variant: "warning" as const };
  }

  return { status: "On Track", variant: "success" as const };
};
