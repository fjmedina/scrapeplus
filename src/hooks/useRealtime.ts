import { useEffect } from 'react';
import { RealtimeService } from '../services/realtime';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

const realtimeService = new RealtimeService();

export function useRealtime() {
  const user = useAuthStore(state => state.user);
  const addNotification = useNotificationStore(state => state.addNotification);

  useEffect(() => {
    if (!user) return;

    realtimeService.subscribeToUserUpdates(user.id, (data) => {
      if (data.type === 'notification') {
        addNotification(data);
      }
    });

    return () => {
      if (user) {
        realtimeService.unsubscribeFromUserUpdates(user.id);
      }
    };
  }, [user, addNotification]);
}