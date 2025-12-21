import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Timetable from "./pages/Timetable";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuthStore } from "./store/auth.store.";
import { useThemeStore } from "./store/theme.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { theme, initTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      initTheme();
      setIsLoading(false);
    };

    initialize();
  }, [checkAuth, initTheme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/auths/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="goals" element={<Goals />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
        />
      </QueryClientProvider>
    </div>
  );
}

export default App;
