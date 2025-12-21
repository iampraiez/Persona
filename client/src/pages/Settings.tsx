import { useState } from "react";
import { Sun, Moon, Bell, User, Lock, Shield, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store.";

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("10");
  const [saveLoading, setSaveLoading] = useState(false);
  const handleSaveSettings = () => {
    setSaveLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSaveLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                      theme === "light"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:bg-secondary"
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                  </button>

                  <button
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border ${
                      theme === "dark"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:bg-secondary"
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Enable notifications
                </label>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationsEnabled ? "bg-accent" : "bg-secondary"
                    }`}
                    onClick={() =>
                      setNotificationsEnabled(!notificationsEnabled)
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notification time (minutes before event)
                </label>
                <select
                  className="input w-full"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  disabled={!notificationsEnabled}
                >
                  {/* <option value="5">5 minutes</option> */}
                  <option value="10">10 minutes</option>
                  {/* <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option> */}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={user?.email}
                  disabled
                />
                <p className="text-xs text-foreground/70 mt-1">
                  Email cannot be changed (Google account)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 ">
                  Display Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  defaultValue={user?.name}
                  disabled
                />
              </div>
            </div>
          </motion.div>

          {/* Data & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Data & Privacy</h2>
            </div>

            <div className="space-y-4">
              <div>
                <button className="text-sm text-foreground/70 hover:text-foreground">
                  Download my data
                </button>
              </div>

              <div>
                <button className="text-sm text-destructive hover:text-destructive/80">
                  Delete my account
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end space-x-3">
            <button className="btn bg-secondary hover:bg-secondary/90">
              Cancel
            </button>

            <button
              className="btn btn-accent flex items-center gap-2"
              onClick={handleSaveSettings}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">AI Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Enable AI suggestions
                </label>
                <div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  AI suggestion frequency
                </label>
                <select className="input w-full">
                  {/* <option>Daily</option>
                  <option>Weekly</option> */}
                  <option>Only when I ask</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data shared with AI
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-events"
                      className="mr-2"
                      checked
                      readOnly
                    />
                    <label htmlFor="ai-events" className="text-sm">
                      Event data
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-goals"
                      className="mr-2"
                      checked
                      readOnly
                    />
                    <label htmlFor="ai-goals" className="text-sm">
                      Goal data
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ai-tasks"
                      className="mr-2"
                      checked
                      readOnly
                    />
                    <label htmlFor="ai-tasks" className="text-sm">
                      Task completion data
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-card rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Session</h2>

            <button
              className="w-full btn bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center gap-2"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
