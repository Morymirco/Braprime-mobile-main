import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/AuthContext';
import NotificationService, { Notification } from '../lib/services/NotificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [notificationsResult, unreadResult] = await Promise.all([
        NotificationService.getUserNotifications(user.id),
        NotificationService.getUnreadCount(user.id)
      ]);

      if (notificationsResult.error) {
        setError('Erreur lors du chargement des notifications');
        return;
      }

      if (unreadResult.error) {
        setError('Erreur lors du comptage des notifications non lues');
        return;
      }

      setNotifications(notificationsResult.data || []);
      setUnreadCount(unreadResult.count);
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await NotificationService.markAsRead(notificationId);
      
      if (result.success) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        
        // Décrémenter le compteur
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const result = await NotificationService.markAllAsRead(user.id);
      
      if (result.success) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        
        // Réinitialiser le compteur
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erreur lors du marquage de toutes comme lues:', err);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const result = await NotificationService.deleteNotification(notificationId);
      
      if (result.success) {
        // Retirer de l'état local
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        
        // Ajuster le compteur si la notification n'était pas lue
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}; 