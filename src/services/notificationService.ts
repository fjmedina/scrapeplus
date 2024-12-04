import { supabase } from '../lib/supabase';

export type NotificationType = 
  | 'analysis_complete' 
  | 'report_ready' 
  | 'subscription_expiring'
  | 'usage_limit'
  | 'system_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

class NotificationService {
  private realtimeSubscription: any;

  async initialize(userId: string, onNotification: (notification: Notification) => void) {
    // Subscribe to user's notifications channel
    this.realtimeSubscription = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(this.transformNotification(payload.new));
        }
      )
      .subscribe();
  }

  cleanup() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
    }
  }

  private transformNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
      data: data.data,
      createdAt: data.created_at,
    };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data.map(this.transformNotification);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
    });

    if (error) throw error;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async clearAllNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export const notificationService = new NotificationService();