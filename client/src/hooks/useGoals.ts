import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";
import { Goal } from "../types/index";

export const useGoals = () => {
  const queryClient = useQueryClient();

  const getApi = () => {
    return useAuthStore.getState().isDemo ? demoApi : api;
  };

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => getApi().getGoals(),
  });

  const createGoalMutation = useMutation({
    mutationFn: (goal: Partial<Goal>) => getApi().createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const updateStepStatusMutation = useMutation({
    mutationFn: ({ goalId, stepId }: { goalId: string; stepId: string }) =>
      getApi().updateStepStatus(goalId, stepId),
    onMutate: async ({ goalId, stepId }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData<Goal[]>(["goals"]);

      queryClient.setQueryData<Goal[]>(["goals"], (old) => {
        if (!old) return [];
        return old.map((goal) => {
          if (goal.id === goalId) {
            return {
              ...goal,
              steps: goal.steps.map((step) =>
                step.id === stepId ? { ...step, isCompleted: true } : step,
              ),
            };
          }
          return goal;
        });
      });

      return { previousGoals };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["goals"], context?.previousGoals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, goal }: { id: string; goal: Partial<Goal> }) =>
      getApi().updateGoal(id, goal),
    onMutate: async ({ id, goal }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData<Goal[]>(["goals"]);

      queryClient.setQueryData<Goal[]>(["goals"], (old) => {
        if (!old) return [];
        return old.map((g) => (g.id === id ? { ...g, ...goal } : g));
      });

      return { previousGoals };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["goals"], context?.previousGoals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => getApi().deleteGoal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData<Goal[]>(["goals"]);

      queryClient.setQueryData<Goal[]>(["goals"], (old) => {
        if (!old) return [];
        return old.filter((g) => g.id !== id);
      });

      return { previousGoals };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["goals"], context?.previousGoals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    goals: goalsQuery.data,
    isLoading: goalsQuery.isLoading,
    isError: goalsQuery.isError,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    updateStepStatus: updateStepStatusMutation.mutate,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isUpdatingStep: updateStepStatusMutation.isPending,
  };
};
