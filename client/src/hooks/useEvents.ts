import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";
import { Event } from "../types/index";

export const useEvents = () => {
  const queryClient = useQueryClient();

  const getApi = () => {
    return useAuthStore.getState().isDemo ? demoApi : api;
  };

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => getApi().getEvents(),
  });

  const upcomingEventsQuery = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => getApi().getUpcomingEvents(),
  });

  const createEventMutation = useMutation({
    mutationFn: (event: Partial<Event>) => getApi().createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, event }: { id: string; event: Partial<Event> }) =>
      getApi().updateEvent(id, event),
    onMutate: async ({ id, event }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previousEvents = queryClient.getQueryData<Event[]>(["events"]);

      queryClient.setQueryData<Event[]>(["events"], (old) => {
        if (!old) return [];
        return old.map((e) => (e.id === id ? { ...e, ...event } : e));
      });

      return { previousEvents };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["events"], context?.previousEvents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const skipEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { skippedReason: string; skippedIsImportant: boolean } }) =>
      getApi().skipEvent(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previousEvents = queryClient.getQueryData<Event[]>(["events"]);

      queryClient.setQueryData<Event[]>(["events"], (old) => {
        if (!old) return [];
        return old.map((e) => (e.id === id ? { ...e, isCompleted: false, skippedReason: data.skippedReason, skippedIsImportant: data.skippedIsImportant, isSpecial: data.skippedIsImportant } : e));
      });

      return { previousEvents };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(["events"], context?.previousEvents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => getApi().deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const createEventsBatchMutation = useMutation({
    mutationFn: (events: Partial<Event>[]) => getApi().createEventsBatch(events),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  return {
    events: eventsQuery.data,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    upcomingEvents: upcomingEventsQuery.data,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    skipEvent: skipEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    createEventsBatch: createEventsBatchMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isCreatingBatch: createEventsBatchMutation.isPending,
  };
};
