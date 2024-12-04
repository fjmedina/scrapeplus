import { RealtimeClient } from '@supabase/realtime-js';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../notification';

export class RealtimeService {
  private subscriptions: Map<string, () => void> = new Map();

  async subscribeToUserUpdates(userId: string, onUpdate: (data: any) => void) {
    // Subscribe to CRM webhook events
    const crmSubscription = supabase
      .channel(`crm-events-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_webhook_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();

    // Subscribe to notifications
    const notificationSubscription = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();

    this.subscriptions.set(userId, () => {
      supabase.removeChannel(crmSubscription);
      supabase.removeChannel(notificationSubscription);
    });
  }

  unsubscribeFromUserUpdates(userId: string) {
    const cleanup = this.subscriptions.get(userId);
    if (cleanup) {
      cleanup();
      this.subscriptions.delete(userId);
    }
  }
}