import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState, useEffect, Suspense } from "react";
import CopyEventsModal from "./CopyEventsModal";
import { startOfWeek, format } from "date-fns";
import { useUser } from "../hooks/useUser";
import Loader from "./Loader";
import FeedbackWidget from "./FeedbackWidget";
import { api } from "../service/api.service";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading || !user) return;

    if (user.lastCopyPromptWeek) return;

    // Get the start and end of the PREVIOUS week
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(currentWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

    // Filter events to only those in the previous week
    if (!user.events || user.events.length === 0) return;

    const prevWeekEvents = user.events.filter((event) => {
      const start = new Date(event.startTime);
      return start >= prevWeekStart && start <= prevWeekEnd;
    });

    // Group by day and count
    const eventsPerDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevWeekStart);
      d.setDate(d.getDate() + i);
      eventsPerDay[format(d, "yyyy-MM-dd")] = 0;
    }

    prevWeekEvents.forEach((event) => {
      const day = format(new Date(event.startTime), "yyyy-MM-dd");
      if (eventsPerDay[day] !== undefined) {
        eventsPerDay[day]++;
      }
    });

    // Check if EVERY day has at least 5 events
    const meetsThreshold = Object.values(eventsPerDay).every(
      (count) => count >= 5,
    );

    if (meetsThreshold) {
      setShowCopyModal(true);
    }
  }, [user, isUserLoading]);

  const handleCloseModal = async () => {
    const currentWeekStart = format(
      startOfWeek(new Date(), { weekStartsOn: 0 }),
      "yyyy-MM-dd",
    );
    try {
      await api.updateLastCopyPromptWeek(currentWeekStart);
    } catch (error) {
      console.error("Failed to update last seen week", error);
    }
    setShowCopyModal(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={`flex flex-col flex-1 w-full transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}
      >
        <Header openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <div className="max-w-screen-xl h-full mx-auto">
            {isUserLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <Loader />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            )}
          </div>
        </main>
      </div>

      <CopyEventsModal isOpen={showCopyModal} onClose={handleCloseModal} />
      <FeedbackWidget />
    </div>
  );
};

export default Layout;
