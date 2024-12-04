import { supabase } from '../../lib/supabase';
import type { NotificationType } from '../../types/notification';

export class NotificationService {
  async create({
    userId,
    type,
    title,
    message,
    data
  }: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false
    });

    if (error) throw error;
  }

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  async delete(notificationId: string, userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const notificationService = new NotificationService();