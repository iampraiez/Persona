import { useQuery } from "@tanstack/react-query";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";

export const useAnalytics = (range: string, date: Date) => {
  const getApi = () => {
    return useAuthStore.getState().isDemo ? demoApi : api;
  };

  const analyticsQuery = useQuery({
    queryKey: ["analytics", range, date.toISOString()],
    queryFn: () => getApi().getAnalytics(range, date),
  });

  return {
    data: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    refetch: analyticsQuery.refetch,
  };
};
