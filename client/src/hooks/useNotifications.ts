import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const getApi = () => {
    return useAuthStore.getState().isDemo ? demoApi : api;
  };

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getApi().getNotifications(),
    refetchInterval: 30000,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => getApi().deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: (subscription: PushSubscription) =>
      getApi().saveSubscription(subscription),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => getApi().markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: () => getApi().clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    deleteNotification: deleteNotificationMutation.mutate,
    saveSubscription: saveSubscriptionMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutate,
    clearAllNotifications: clearAllNotificationsMutation.mutate,
  };
};
