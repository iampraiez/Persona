import {
  BellRing,
  Menu,
  Moon,
  Sun,
  Calendar,
  Target,
  BarChart,
} from "lucide-react";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store.";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

interface HeaderProps {
  openSidebar: () => void;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
}

const Header = ({ openSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notis, setNotis] = useState<Notification[]>([]);
  const [number, setNumber] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    async function getNotis() {
      try {
        const { data } = await axios.get<Notification[]>(
          `${API_URL}/api/notis`
        );
        console.log("Notis", data);
        setNotis(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    getNotis();
  }, []);

  const navigate = useNavigate();

  async function subscribeUser() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return; // Already subscribed
      }

      const {
        data: { publicKey },
      } = await axios.get(`${API_URL}/api/notis/public-key`);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await axios.post(`${API_URL}/api/notis/save-subscription`, {
        subscription: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error("Error subscribing user:", error);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const raw = atob(base64);
    return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
  }

  useEffect(() => {
    if (Notification.permission === "granted") {
      subscribeUser();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          subscribeUser();
        }
      });
    }
  }, []);

  return (
    <header className="py-4 px-6 bg-card border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={openSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold flex items-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent"
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
          <button onClick={() => navigate("/auths/")}>
            <span className="text-accent">Time</span>
            <span className="text-foreground">forge</span>
          </button>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="hidden md:inline-flex"
          onClick={() => navigate("/auths/timetable")}
        >
          <Calendar className="h-5 w-5" />
        </button>
        <button
          className="hidden md:inline-flex"
          onClick={() => navigate("/auths/goals")}
        >
          <Target className="h-5 w-5" />
        </button>
        <button onClick={() => navigate("/auths/analytics")}>
          <BarChart className="hidden md:inline-flex" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-secondary"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 rounded-md hover:bg-secondary relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <BellRing className="h-5 w-5" />
            {notis.length > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
            )}
          </button>
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-72 bg-card rounded-md shadow-lg py-1 z-10 border border-border"
              >
                <div className="px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                {notis.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {[...notis]
                      .reverse()
                      .slice(0, number)
                      .map((noti) => (
                        <div
                          key={noti.id}
                          className="py-2 px-4 hover:bg-secondary"
                        >
                          <p className="text-sm font-medium">{noti.title}</p>
                          <p className="text-sm">{noti.body}</p>
                          <p className="text-xs text-foreground/70 mt-1">
                            {noti.timeAgo}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-2 px-4">
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
                <button
                  onClick={() => setNumber(notis.length)}
                  className="block text-center text-sm text-accent border-t px-4 py-2 border-b border-border"
                  disabled={!notis.length}
                >
                  View all notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              {user?.image ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.image}
                  alt="Profile"
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.name || "User"}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 border border-border"
              >
                <button
                  onClick={() => {
                    navigate("/auths/settings");
                    setProfileOpen(false);
                  }}
                  className="block px-4 py-2 text-sm hover:bg-secondary"
                >
                  Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary"
                  onClick={() => useAuthStore.getState().logout()}
                >
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
