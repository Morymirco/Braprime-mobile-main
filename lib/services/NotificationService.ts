import { supabase } from '../supabase/config';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  data: any;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationType {
  id: number;
  name: string;
  title: string;
  icon: string;
  color: string;
  created_at: string;
}

class NotificationService {
  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications(userId: string): Promise<{ data: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Récupérer les notifications non lues
  async getUnreadNotifications(userId: string): Promise<{ data: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Compter les notifications non lues
  async getUnreadCount(userId: string): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Récupérer les types de notifications
  async getNotificationTypes(): Promise<{ data: NotificationType[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notification_types')
        .select('*')
        .order('id', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Créer une nouvelle notification (pour les tests ou notifications système)
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default new NotificationService(); 