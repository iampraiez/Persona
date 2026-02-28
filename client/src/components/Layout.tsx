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

    const currentWeekStart = format(
      startOfWeek(new Date(), { weekStartsOn: 0 }),
      "yyyy-MM-dd",
    );

    if (user.lastCopyPromptWeek !== currentWeekStart) {
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
