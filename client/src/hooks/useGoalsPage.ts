import { useState, useCallback } from "react";
import { useGoals } from "./useGoals";
import { Goal, Step } from "../types";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";

export const useGoalsPage = () => {
  const {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateStepStatus,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStep,
  } = useGoals();

  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState<string | null>(null);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [stepCount, setStepCount] = useState<number>(10);
  const [newGoal, setNewGoal] = useState<Goal>({
    id: "",
    title: "",
    description: "",
    totalDays: 0,
    createdAt: new Date().toISOString(),
    userId: "",
    steps: [],
  });

  const handleReset = useCallback(
    async (id: string) => {
      const goal = goals?.find((g: Goal) => g.id === id);
      if (!goal) return;

      const updatedSteps = (goal.steps || []).map((step: Step) => ({
        ...step,
        isCompleted: false,
        skippedIsImportant: false,
        skippedReason: null,
      }));

      updateGoal(
        { id, goal: { steps: updatedSteps } },
        {
          onSuccess: () => {
            setExpandedGoal(null);
            setOptionsModalOpen(null);
            toast.success("Goal reset successfully");
          },
          onError: () => {
            toast.error("Failed to reset goal");
          },
        },
      );
    },
    [goals, updateGoal],
  );

  const handleEdit = useCallback(
    (id: string) => {
      const goal = goals?.find((g: Goal) => g.id === id);
      if (goal) {
        setNewGoal(goal);
        setShowNewGoalModal(true);
        setExpandedGoal(null);
        setOptionsModalOpen(null);
      } else {
        toast.error("Goal not found");
      }
    },
    [goals],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this goal?")) return;
      deleteGoal(id, {
        onSuccess: () => {
          setExpandedGoal(null);
          setOptionsModalOpen(null);
          toast.success("Goal deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete goal");
        },
      });
    },
    [deleteGoal],
  );

  const completeStep = useCallback(
    async (stepId: string) => {
      const goal = goals?.find((g: Goal) =>
        (g.steps || []).some((s: Step) => s.id === stepId),
      );
      if (!goal) return;

      updateStepStatus(
        { goalId: goal.id, stepId },
        {
          onSuccess: () => {
            toast.success("Step marked as complete");
          },
          onError: () => {
            toast.error("Failed to mark step as complete");
          },
        },
      );
    },
    [goals, updateStepStatus],
  );

  const handleCreateGoal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGoal.title || !newGoal.totalDays) {
        toast.error("Please fill out goal title and valid time frame");
        return;
      }

      createGoal(newGoal, {
        onSuccess: () => {
          setShowNewGoalModal(false);
          setNewGoal({
            id: "",
            title: "",
            description: "",
            totalDays: 0,
            createdAt: new Date().toISOString(),
            userId: "",
            steps: [],
          });
          toast.success("Goal created successfully");
        },
        onError: () => {
          toast.error("Failed to create goal");
        },
      });
    },
    [newGoal, createGoal],
  );

  const handleUpdateGoal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGoal.id || !newGoal.title || (newGoal.totalDays || 0) <= 0) {
        toast.error("Please fill out goal title and valid time frame");
        return;
      }

      const updateData: Partial<Goal> = {
        title: newGoal.title,
        description: newGoal.description,
        totalDays: newGoal.totalDays,
        steps: newGoal.steps.map((s) => ({
          ...s,
          dueDate: new Date(s.dueDate).toISOString(),
        })),
      };

      updateGoal(
        { id: newGoal.id.toString(), goal: updateData },
        {
          onSuccess: () => {
            setShowNewGoalModal(false);
            setNewGoal({
              id: "",
              title: "",
              description: "",
              totalDays: 0,
              createdAt: new Date().toISOString(),
              userId: "",
              steps: [],
            });
            toast.success("Goal updated successfully");
          },
          onError: () => {
            toast.error("Failed to update goal");
          },
        },
      );
    },
    [newGoal, updateGoal],
  );

  const handleStepCountChange = useCallback((count: number) => {
    setStepCount(count);
    setNewGoal((prev) => {
      const currentSteps = [...prev.steps];
      if (count > currentSteps.length) {
        const stepsToAdd = count - currentSteps.length;
        for (let i = 0; i < stepsToAdd; i++) {
          currentSteps.push({
            id: `${currentSteps.length + 1 + i}`,
            title: "",
            description: "",
            dueDate: new Date().toISOString(),
            isCompleted: false,
          });
        }
      } else if (count < currentSteps.length) {
        currentSteps.splice(count);
      }
      return { ...prev, steps: currentSteps };
    });
  }, []);

  const generateSteps = useCallback(
    async (goalTitle: string, days: number, count: number) => {
      if (!goalTitle.trim() || days <= 0 || count <= 0) {
        toast.error("Please provide a goal, valid time frame, and step count");
        return;
      }
      try {
        setGeneratingSteps(true);
        const getApi = () => (useAuthStore.getState().isDemo ? demoApi : api);

        const currentStepsParams = newGoal.steps.map(
          ({ title, description }) => ({
            title,
            description,
          }),
        );

        const data = await getApi().generateSteps(
          { title: goalTitle, description: newGoal.description },
          days,
          count,
          currentStepsParams,
        );

        const editedSteps = data.steps.map(({ dueDate, ...rest }) => ({
          ...rest,
          dueDate: new Date(dueDate as string).toISOString(),
        }));

        setNewGoal((prev) => ({
          ...prev,
          steps: editedSteps.map((step, index) => ({
            ...step,
            dueDate: new Date(step.dueDate).toISOString(),
            id: `${prev.steps.length + 1 + index}`,
            isCompleted: false,
          })),
        }));

        toast.success("Steps generated successfully");
      } catch {
        toast.error("Error generating steps");
      } finally {
        setGeneratingSteps(false);
      }
    },
    [newGoal, newGoal.description, newGoal.steps.length],
  );

  const toggleExpandGoal = useCallback((goalId: string | null) => {
    setExpandedGoal((prev) => (prev === goalId ? null : goalId));
    setOptionsModalOpen(null);
  }, []);

  const toggleExpandOption = useCallback((optId: string | null) => {
    setOptionsModalOpen((prev) => (prev === optId ? null : optId));
  }, []);

  return {
    goals,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStep,

    showNewGoalModal,
    setShowNewGoalModal,
    expandedGoal,
    setExpandedGoal,
    optionsModalOpen,
    setOptionsModalOpen,
    generatingSteps,
    stepCount,
    setStepCount,
    newGoal,
    setNewGoal,

    handleReset,
    handleEdit,
    handleDelete,
    completeStep,
    handleCreateGoal,
    handleUpdateGoal,
    handleStepCountChange,
    generateSteps,
    toggleExpandGoal,
    toggleExpandOption,
  };
};
