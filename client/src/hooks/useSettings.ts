import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store";
import { useUser } from "./useUser";
import { api, User } from "../service/api.service";
import { demoApi } from "../service/demo.service";

interface UseSettingsReturn {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  user: User | null | undefined;
  logout: () => void;
  name: string;
  setName: (name: string) => void;
  profileSaving: boolean;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationTime: string;
  setNotificationTime: (time: string) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  deleteCode: string;
  setDeleteCode: (code: string) => void;
  timeRemaining: number;
  isDeleting: boolean;
  isSendingCode: boolean;
  handleSaveProfile: () => Promise<void>;
  handleRequestDelete: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const { theme, setTheme } = useThemeStore();
  const { logout, isDemo } = useAuthStore();
  const { data: user, refetch } = useUser();
  const [name, setName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState("15");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const getApi = useCallback(() => (isDemo ? demoApi : api), [isDemo]);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      setNotificationsEnabled(user.notificationsEnabled ?? true);
      setNotificationTime((user.defaultNotifyBefore ?? 15).toString());
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const saveNotifications = async () => {
      if (
        notificationsEnabled !== user.notificationsEnabled ||
        parseInt(notificationTime) !== user.defaultNotifyBefore
      ) {
        try {
          await getApi().updateUserProfile({
            notificationsEnabled,
            defaultNotifyBefore: parseInt(notificationTime),
          });
          await refetch();
        } catch {
          console.error("Failed to auto-save notification settings:");
        }
      }
    };

    const timeoutId = setTimeout(saveNotifications, 1000);
    return () => clearTimeout(timeoutId);
  }, [notificationsEnabled, notificationTime, user, refetch, getApi]);

  useEffect(() => {
    if (!codeExpiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(
        0,
        Math.floor((new Date(codeExpiry).getTime() - now.getTime()) / 1000),
      );
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
    } catch {
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
    } catch {
      const errorMessage = "Failed to send verification code";
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
    } catch {
      const errorMessage = "Failed to delete account";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    theme,
    setTheme,
    user,
    logout,
    name,
    setName,
    profileSaving,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationTime,
    setNotificationTime,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showDeleteModal,
    setShowDeleteModal,
    deleteCode,
    setDeleteCode,
    timeRemaining,
    isDeleting,
    isSendingCode,
    handleSaveProfile,
    handleRequestDelete,
    handleDeleteAccount,
  };
};
