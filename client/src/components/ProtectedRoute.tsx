import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {
  const location = useLocation();
  if (
    !isAuthenticated &&
    location.pathname !== "/login" &&
    location.pathname !== "/"
  ) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
