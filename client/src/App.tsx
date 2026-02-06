import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import { useThemeStore } from "./store/theme.store";
import Loader from "./components/Loader";
import { LazyMotion, domAnimation } from "framer-motion";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "react-toastify/dist/ReactToastify.css";


const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Timetable = lazy(() => import("./pages/Timetable"));
const Goals = lazy(() => import("./pages/Goals"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FocusSession = lazy(() => import("./pages/FocusSession"));
const BuyCredits = lazy(() => import("./pages/BuyCredits"));

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className={theme}>
      <ErrorBoundary>
        <LazyMotion features={domAnimation}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<Loader />}>
                      <LandingPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<Loader />}>
                      <Login />
                    </Suspense>
                  }
                />
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
                  <Route path="focus/:id" element={<FocusSession />} />
                  <Route path="buy-credits" element={<BuyCredits />} />
                </Route>
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<Loader />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </Router>
        </LazyMotion>
      </ErrorBoundary>
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
