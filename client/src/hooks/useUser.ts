import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, User } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";

export const useUser = () => {
  const { setUser, setAuthenticated, isDemo } = useAuthStore();

  const getApi = useMemo(() => {
    return isDemo ? demoApi : api;
  }, [isDemo]);

  const query = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User | null> => {
      const user = await getApi.getUser();
      if (user) {
        setUser(user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      return user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return query;
};
