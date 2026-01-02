import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";
import { useUser } from "./useUser";

export const useInsights = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const getApi = () => {
    return useAuthStore.getState().isDemo ? demoApi : api;
  };

  const suggestionsQuery = useQuery({
    queryKey: ["insights"],
    queryFn: () => getApi().getSuggestions(),
    staleTime: 1000 * 60 * 5,
    enabled: false, // Disable automatic fetching
    initialData: user?.cachedInsights,
  });

  const generateMutation = useMutation({
    mutationFn: () => getApi().getSuggestions(),
    onSuccess: (data) => {
      queryClient.setQueryData(["insights"], data);
      queryClient.invalidateQueries({ queryKey: ["user"] }); // Update credits
    },
    onError: (error: any) => {
      // Error is handled by the component or global handler, but we can add toast here if needed
      // For now, we'll let the component handle UI feedback via isError
    },
  });

  return {
    suggestions: suggestionsQuery.data || user?.cachedInsights,
    isLoading: suggestionsQuery.isLoading,
    isError: suggestionsQuery.isError,
    generateInsights: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
  };
};
