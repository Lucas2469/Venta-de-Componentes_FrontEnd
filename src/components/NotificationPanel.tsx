import React, { useEffect, useState } from 'react';
import { Bell, Clock, User, X, Eye, Mail } from 'lucide-react';
import { Notification, fetchRecentNotifications, markNotificationAsRead } from '../api/notifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onNavigateToNotifications: (notificationId?: number) => void;
}

export function NotificationPanel({ isOpen, onClose, userId, onNavigateToNotifications }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await fetchRecentNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    // Si no está leída, marcarla como leída
    if (notification.estado === 'no_vista') {
      try {
        await markNotificationAsRead(notification.id, userId);
        // Actualizar el estado local
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, estado: 'vista' as const }
              : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navegar a la página completa y expandir esta notificación
    onNavigateToNotifications(notification.id);
    onClose();
  }

  function getNotificationIcon(tipo: string) {
    switch (tipo) {
      case 'creditos':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'producto':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'agendamiento':
        return <div className="w-2 h-2 bg-purple-500 rounded-full" />;
      case 'calificacion':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays}d`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-800 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  notification.estado === 'no_vista'
                    ? 'bg-yellow-50 border-l-4 border-yellow-400'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.tipo_notificacion)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      notification.estado === 'no_vista' ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.titulo}
                    </p>

                    <p className="text-xs text-gray-500 truncate mt-1">
                      {notification.mensaje}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(notification.fecha_creacion)}
                      </span>
                      {notification.estado === 'no_vista' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                          Nueva
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Read indicator */}
                  {notification.estado === 'vista' && (
                    <div className="flex-shrink-0 mt-1">
                      <Eye className="h-3 w-3 text-green-500" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              onNavigateToNotifications();
              onClose();
            }}
            className="w-full px-3 py-2 text-sm text-pink-700 hover:bg-pink-50 rounded-md transition-colors font-medium"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}