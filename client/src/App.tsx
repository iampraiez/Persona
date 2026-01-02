import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Timetable from "./pages/Timetable";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import { useThemeStore } from "./store/theme.store";
import Loader from "./components/Loader";
import { useUser } from "./hooks/useUser";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme, initTheme } = useThemeStore();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (isAuthenticated && user) {
      import("./store/notis.store").then((m) => {
        const runDailyNotifications = m.default;
        runDailyNotifications(user.events);
      });
      if ("Notification" in window && Notification.permission === "granted") {
        import("./utils/push.util").then((m) => m.subscribeUser());
      }
    }
  }, [isAuthenticated, user]);

  if (isUserLoading) return <Loader />;

  return (
    <div className={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="goals" element={<Goals />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
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
    </div>
  );
}

export default App;
