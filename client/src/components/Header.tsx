import {
  BellRing,
  Menu,
  Moon,
  Sun,
  Calendar,
  Target,
  BarChart,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
} from "lucide-react";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store";
import { useNotifications } from "../hooks/useNotifications";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import { subscribeUser } from "../utils/push.util";

interface HeaderProps {
  openSidebar: () => void;
}

const Header = ({ openSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const [number, setNumber] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { notifications, clearAllNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/analytics", icon: BarChart, label: "Analytics" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={openSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-accent transition-transform group-hover:scale-110"
                >
                  <path
                    d="M12 8V12L14.5 14.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.6087 19C3.58041 19 2.0016 17.2091 2.0016 15C2.0016 13.1358 3.1232 11.5693 4.72195 11.1469C4.89261 8.32075 7.15425 6 9.99739 6C12.1229 6 13.9532 7.2926 14.8308 9.1206C15.0769 9.04211 15.3348 9 15.6016 9C17.2584 9 18.6016 10.3431 18.6016 12C18.6016 12.2321 18.5739 12.4562 18.5216 12.6693C19.827 13.2784 20.7516 14.5478 20.7516 16C20.7516 18.2091 18.9608 20 16.9325 20H5.6087Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">
                <span className="text-accent">Time</span>
                <span className="text-foreground">forge</span>
              </h1>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent/10 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={toggleTheme}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
                onClick={async () => {
                  if (!notificationsOpen) {
                    if ("Notification" in window) {
                      if (Notification.permission === "default") {
                        const permission = await Notification.requestPermission();
                        if (permission === "granted") {
                          subscribeUser();
                        }
                      } else if (Notification.permission === "granted") {
                        subscribeUser();
                      }
                    }
                  }
                  setNotificationsOpen(!notificationsOpen);
                }}
                title="Notifications"
              >
                <BellRing className="h-5 w-5" />
                {notifications.some((n: any) => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-card"></span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-secondary/30">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => clearAllNotifications()}
                          className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="h-3 w-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {[...notifications]
                          .reverse()
                          .slice(0, number)
                          .map((noti: any) => (
                            <div
                              key={noti.id}
                              className={`py-3 px-4 hover:bg-secondary/50 border-b border-border/50 last:border-0 transition-colors ${
                                !noti.isRead ? "bg-accent/5" : ""
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-snug mb-1 truncate">
                                    {noti.title}
                                  </p>
                                  <p className="text-xs text-foreground/70 line-clamp-2">
                                    {noti.body}
                                  </p>
                                  <p className="text-[10px] text-foreground/50 mt-1">
                                    {noti.timeAgo}
                                  </p>
                                </div>
                                {!noti.isRead && (
                                  <span className="h-2 w-2 bg-accent rounded-full shrink-0 mt-1"></span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-12 px-4 text-center">
                        <BellRing className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-foreground/60 font-medium">
                          No notifications yet
                        </p>
                        <p className="text-xs text-foreground/40 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    )}
                    {notifications.length > 3 && (
                      <button
                        onClick={() =>
                          setNumber(
                            number === 3 ? notifications.length : 3
                          )
                        }
                        className="w-full text-center text-xs text-accent bg-secondary/30 border-t px-4 py-2.5 border-border hover:bg-secondary/50 transition-colors font-medium"
                      >
                        {number === 3 ? (
                          <span className="flex items-center justify-center gap-1">
                            View all notifications
                            <ChevronDown className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            Show less
                            <ChevronUp className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-secondary transition-all"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent ring-1 ring-accent/20">
                  {user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.image}
                      alt="Profile"
                    />
                  ) : (
                    <span className="font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {user?.name || "User"}
                </span>
                <ChevronDown className={`hidden md:block h-4 w-4 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border bg-secondary/30">
                      <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => useAuthStore.getState().logout()}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
