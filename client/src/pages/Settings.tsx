import { useState, useEffect } from "react";
import { Sun, Moon, Bell, User, Shield, LogOut, Trash2, Mail, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store";
import { useUser } from "../hooks/useUser";
import { api } from "../service/api.service";
import { demoApi } from "../service/demo.service";
import { toast } from "react-toastify";

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const { logout, isDemo } = useAuthStore();
  const { data: user, refetch } = useUser();
  
  // Profile state
  const [name, setName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("15");
  
  // Delete account flow
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const getApi = () => (isDemo ? demoApi : api);

  // Initialize from user data
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      setNotificationsEnabled(user.notificationsEnabled ?? true);
      setNotificationTime((user.defaultNotifyBefore ?? 15).toString());
    }
  }, [user]);

  // Auto-save notification settings
  useEffect(() => {
    if (!user) return;
    
    const saveNotifications = async () => {
      // Only save if values actually changed from user data
      if (notificationsEnabled !== user.notificationsEnabled || 
          parseInt(notificationTime) !== user.defaultNotifyBefore) {
        try {
          await getApi().updateUserProfile({
            notificationsEnabled,
            defaultNotifyBefore: parseInt(notificationTime)
          });
          // No toast for auto-save to avoid spamming, but we could refetch
          await refetch();
        } catch (error) {
          console.error("Failed to auto-save notification settings:", error);
        }
      }
    };

    const timeoutId = setTimeout(saveNotifications, 1000);
    return () => clearTimeout(timeoutId);
  }, [notificationsEnabled, notificationTime, user]);

  // Countdown timer for delete code
  useEffect(() => {
    if (!codeExpiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((new Date(codeExpiry).getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setShowDeleteModal(false);
        toast.error("Verification code expired. Please try again.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiry]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setProfileSaving(true);
    try {
      await getApi().updateUserProfile({ name: name.trim() });
      await refetch();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRequestDelete = async () => {
    setIsSendingCode(true);
    try {
      const response = await getApi().requestAccountDeletion();
      setCodeExpiry(new Date(response.expiresAt));
      setTimeRemaining(300);
      setShowDeleteConfirm(false);
      setShowDeleteModal(true);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteCode.trim() || deleteCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsDeleting(true);
    try {
      await getApi().deleteAccount(deleteCode);
      toast.success("Account deleted successfully");
      setTimeout(() => {
        logout();
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={user?.email || ""}
                  disabled
                />
                <p className="text-xs text-foreground/70 mt-1">
                  Email cannot be changed (Google account)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <button
                    className="btn btn-accent px-6"
                    onClick={handleSaveProfile}
                    disabled={profileSaving || name === user?.name}
                  >
                    {profileSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${
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
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable notifications</label>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? "bg-accent" : "bg-secondary"
                  }`}
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
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
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card rounded-lg p-6 border border-destructive/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-foreground/70">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                className="w-full btn bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-5 w-5" />
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Session</h2>
            <button
              className="w-full btn bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-2"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-card rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Member since</span>
                <span className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Total Events</span>
                <span className="font-medium">{user?.events?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Active Goals</span>
                <span className="font-medium">{user?.goals?.length || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold">Delete Account?</h2>
              </div>

              <p className="text-foreground/70 mb-6">
                This will permanently delete your account and all associated data including
                events, goals, and progress. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 btn bg-secondary hover:bg-secondary/80"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 btn bg-destructive hover:bg-destructive/90 text-white"
                  onClick={handleRequestDelete}
                  disabled={isSendingCode}
                >
                  {isSendingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Verification Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">Enter Verification Code</h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteCode("");
                  }}
                  className="p-2 hover:bg-secondary rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-foreground/70 mb-4">
                We've sent a 6-digit verification code to <strong>{user?.email}</strong>.
                Enter it below to confirm account deletion.
              </p>

              <div className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-md">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {formatTime(timeRemaining)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    className="input w-full text-center text-2xl tracking-wider font-mono"
                    placeholder="000000"
                    value={deleteCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setDeleteCode(value);
                    }}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  className="w-full btn bg-destructive hover:bg-destructive/90 text-white"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteCode.length !== 6}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Deletion"
                  )}
                </button>

                <button
                  className="w-full btn bg-secondary hover:bg-secondary/80"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteCode("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
