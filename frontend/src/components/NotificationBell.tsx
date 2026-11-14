import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../types';
import { formatDate } from '../utils/formatters';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead?: (id: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkRead,
}) => {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.is_read);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} className="text-gray-600" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unread.length > 0 && (
                <span className="text-xs text-blue-600">{unread.length} unread</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No notifications
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                      !n.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onMarkRead && onMarkRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.is_read ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
