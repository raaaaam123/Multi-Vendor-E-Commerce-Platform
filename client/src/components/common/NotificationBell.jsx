import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../redux/slices/notificationSlice";

const formatRelativeTime = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

const typeStyles = {
  order_placed: "bg-blue-50 text-blue-600",
  payment_success: "bg-green-50 text-green-600",
  order_shipped: "bg-indigo-50 text-indigo-600",
  order_delivered: "bg-teal-50 text-teal-600",
  vendor_approved: "bg-emerald-50 text-emerald-600",
  vendor_rejected: "bg-red-50 text-red-600",
  low_stock: "bg-orange-50 text-orange-600",
  new_review: "bg-purple-50 text-purple-600",
  new_order: "bg-yellow-50 text-yellow-600",
};

const typeIcons = {
  order_placed: "M16 11V7a4 4 0 00-8 0v4M5 9h14v11H5V9z",
  payment_success: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  order_shipped: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  order_delivered: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  vendor_approved: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  vendor_rejected: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  low_stock: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  new_review: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  new_order: "M16 11V7a4 4 0 00-8 0v4M5 9h14v11H5V9z",
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleToggle = () => {
    setOpen((value) => !value);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => dispatch(markAllNotificationsRead())}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:text-gray-300"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li key={notification._id}>
                    <button
                      onClick={() => handleItemClick(notification)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          typeStyles[notification.type] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <svg
                          className="w-4.5 h-4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d={typeIcons[notification.type] || typeIcons.new_order} />
                        </svg>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-medium ${
                              notification.isRead ? "text-gray-600" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0"></span>
                          )}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </span>
                        <span className="block text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;