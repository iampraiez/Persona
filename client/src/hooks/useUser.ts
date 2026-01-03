import { useQuery } from "@tanstack/react-query";
import { api, User } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { useAuthStore } from "../store/auth.store";
import { useEffect } from "react";

export const useUser = ()  => {
  const { setUser, setAuthenticated, isDemo } = useAuthStore();

  const getApi = () => {
    return isDemo ? demoApi : api;
  };

  const query = useQuery({
    queryKey: ["user"],
    queryFn: (): Promise<User | null> => getApi().getUser(),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
      setAuthenticated(true);
    } else if (query.isError) {
      setUser(null);
      setAuthenticated(false);
    }
  }, [query.data, query.isError, setUser, setAuthenticated]);

  return query;
};
