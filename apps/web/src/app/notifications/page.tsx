'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { notificationsApi } from '../../lib/api/notifications';
import { Notification } from '../../types/notification';
import { Alert } from '../../components/Alert';

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications(tab);
  }, [tab]);

  const fetchNotifications = async (currentTab: 'all' | 'unread') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (currentTab === 'unread') {
        const unreads = await notificationsApi.getUnreadNotifications();
        setNotifications(unreads);
      } else {
        const all = await notificationsApi.getNotifications();
        setNotifications(all);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to retrieve notifications from the Notification Service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    setMarkingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, read: true } : n))
          .filter((n) => (tab === 'unread' ? !n.read : true))
      );
      setSuccessMessage(`Notification #${id} marked as read.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark notification as read.');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1>Notifications</h1>
            <p className="subtitle">
              Your real-time event updates and alerts from backend microservices.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fetchNotifications(tab)}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            title="Notification Error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        )}

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            All Notifications
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'unread' ? 'active' : ''}`}
            onClick={() => setTab('unread')}
          >
            Unread Only
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p className="subtitle">
              {tab === 'unread'
                ? 'You have caught up with all your notifications!'
                : 'You do not have any notifications yet. Place an order to receive event alerts.'}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => {
              const formattedDate = notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : 'Recently';

              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      <span>{notification.title}</span>
                      <span className="badge badge-processing">{notification.type || 'EVENT'}</span>
                      {!notification.read && <span className="badge badge-pending">Unread</span>}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formattedDate}</span>
                  </div>

                  {!notification.read && (
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markingId === notification.id}
                      >
                        {markingId === notification.id ? 'Marking...' : 'Mark Read'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
