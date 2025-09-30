import React, { useEffect, useState } from 'react';
import {
  Bell,
  Eye,
  EyeOff,
  Trash2,
  Mail,
  MailOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  User as UserIcon,
  Package,
  CreditCard,
  Star
} from 'lucide-react';
import {
  Notification,
  fetchUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  NotificationFilters
} from '../api/notifications';

interface NotificationsPageProps {
  userId: number;
  expandNotificationId?: number; // Para auto-expandir una notificación específica
}

export function NotificationsPage({ userId, expandNotificationId }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(expandNotificationId || null);

  useEffect(() => {
    loadNotifications();
  }, [userId, filter, typeFilter]);

  // Auto-expandir notificación específica si se proporciona
  useEffect(() => {
    if (expandNotificationId) {
      setExpandedId(expandNotificationId);
    }
  }, [expandNotificationId]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const filters: NotificationFilters = {};

      if (filter === 'unread') filters.estado = 'no_vista';
      if (filter === 'read') filters.estado = 'vista';
      if (typeFilter) filters.tipo_notificacion = typeFilter;

      const data = await fetchUserNotifications(userId, filters);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRead(notification: Notification) {
    if (notification.estado === 'no_vista') {
      try {
        await markNotificationAsRead(notification.id, userId);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, estado: 'vista' as const }
              : n
          )
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  }

  async function handleDelete(notificationId: number) {
    try {
      await deleteNotification(notificationId, userId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedIds(prev => prev.filter(id => id !== notificationId));
      if (expandedId === notificationId) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  function handleSelectAll() {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  }

  function handleNotificationClick(notification: Notification) {
    // Toggle expand
    if (expandedId === notification.id) {
      setExpandedId(null);
    } else {
      setExpandedId(notification.id);
      // Auto-mark as read when expanding
      if (notification.estado === 'no_vista') {
        handleToggleRead(notification);
      }
    }
  }

  function getNotificationIcon(tipo: string) {
    switch (tipo) {
      case 'creditos':
        return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'producto':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'agendamiento':
        return <Clock className="h-5 w-5 text-purple-600" />;
      case 'calificacion':
        return <Star className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  }

  function formatDate(dateString: string, full: boolean = false): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (full) {
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    if (diffInDays === 0) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return date.toLocaleDateString('es-ES', { weekday: 'short' });
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  const unreadCount = notifications.filter(n => n.estado === 'no_vista').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-pink-800 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas las notificaciones están al día'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Estado:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Todas</option>
                <option value="unread">No leídas</option>
                <option value="read">Leídas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tipo:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Todos</option>
                <option value="producto">Productos</option>
                <option value="creditos">Créditos</option>
                <option value="agendamiento">Agendamientos</option>
                <option value="calificacion">Calificaciones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Toolbar */}
          {notifications.length > 0 && (
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === notifications.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-600">Seleccionar todas</span>
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedIds.length} seleccionadas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-800 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : filter === 'read'
                  ? 'No tienes notificaciones leídas'
                  : 'Aún no tienes notificaciones'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${
                    notification.estado === 'no_vista'
                      ? 'bg-yellow-50 border-l-4 border-yellow-400'
                      : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  {/* Notification Row */}
                  <div className="p-4 flex items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, notification.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.tipo_notificacion)}
                    </div>

                    {/* Content */}
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 text-left focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium truncate ${
                              notification.estado === 'no_vista' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.titulo}
                            </p>
                            {notification.estado === 'no_vista' && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {notification.mensaje.length > 100
                              ? `${notification.mensaje.substring(0, 100)}...`
                              : notification.mensaje
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-gray-400">
                            {formatDate(notification.fecha_creacion)}
                          </span>
                          {expandedId === notification.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRead(notification)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title={notification.estado === 'no_vista' ? 'Marcar como leída' : 'Marcar como no leída'}
                      >
                        {notification.estado === 'no_vista' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar notificación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === notification.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="pt-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getNotificationIcon(notification.tipo_notificacion)}
                              <div>
                                <h3 className="font-semibold text-gray-900">{notification.titulo}</h3>
                                <p className="text-sm text-gray-500">
                                  {notification.remitente_nombre && notification.remitente_apellido
                                    ? `De: ${notification.remitente_nombre} ${notification.remitente_apellido}`
                                    : 'Sistema'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(notification.fecha_creacion, true)}
                            </div>
                          </div>

                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {notification.mensaje}
                            </p>
                          </div>

                          {notification.fecha_vista && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Eye className="h-3 w-3" />
                                <span>Leída el {formatDate(notification.fecha_vista, true)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}