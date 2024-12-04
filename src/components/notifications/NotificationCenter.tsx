import React, { useEffect } from 'react';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { format } from 'date-fns';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    initialize,
    cleanup,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'analysis_complete':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'report_ready':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'subscription_expiring':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'usage_limit':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => markAllAsRead()}
                  className="p-1 text-gray-400 hover:text-gray-500"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-5 w-5" />
                </button>
                <button
                  onClick={() => clearAll()}
                  className="p-1 text-gray-400 hover:text-gray-500"
                  title="Clear all"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <div className="mt-2 text-xs text-gray-400">
                          {format(
                            new Date(notification.createdAt),
                            'MMM d, yyyy HH:mm'
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}