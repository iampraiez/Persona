import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState, useEffect, Suspense } from 'react';
import CopyEventsModal from './CopyEventsModal';
import { startOfWeek, format } from 'date-fns';
import { useUser } from '../hooks/useUser';
import Loader from './Loader';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const { isLoading: isUserLoading } = useUser();

  useEffect(() => {
    const lastSeenWeek = localStorage.getItem('last_seen_week');
    const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');

    if (lastSeenWeek !== currentWeekStart) {
      setShowCopyModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
    localStorage.setItem('last_seen_week', currentWeekStart);
    setShowCopyModal(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header openSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            {isUserLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader />
                </div>
              }>
                <Outlet />
              </Suspense>
            )}
          </div>
        </main>
      </div>

      <CopyEventsModal 
        isOpen={showCopyModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Layout;