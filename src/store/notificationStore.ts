import { create } from 'zustand';
import { notificationService, type Notification, type NotificationType } from '../services/notificationService';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  initialize: () => Promise<void>;
  cleanup: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  createNotification: (
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  initialize: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });

    try {
      const notifications = await notificationService.getNotifications(user.id);
      set({
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        loading: false,
      });

      // Set up realtime subscription
      notificationService.initialize(user.id, (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
      set({ loading: false });
    }
  },

  cleanup: () => {
    notificationService.cleanup();
  },

  markAsRead: async (notificationId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.markAsRead(notificationId, user.id);
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.deleteNotification(notificationId, user.id);
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: state.notifications.find(n => n.id === notificationId)?.read
          ? state.unreadCount
          : state.unreadCount - 1,
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  clearAll: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.clearAllNotifications(user.id);
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  createNotification: async (type, title, message, data) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.createNotification(user.id, type, title, message, data);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },
}));