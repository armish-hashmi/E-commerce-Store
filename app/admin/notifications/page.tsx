'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface NotificationDoc {
  id: string;
  title?: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: any;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('recipientType', '==', 'admin'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc));
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.error('Notification listener error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    setMarkingAll(true);
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading notifications...</div>
        ) : visibleNotifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visibleNotifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleMarkRead(n.id)}
                  disabled={n.read}
                  className={`flex w-full items-start gap-3 px-6 py-4 text-left transition hover:bg-gray-50 ${
                    n.read ? '' : 'bg-indigo-50/40'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      n.read ? 'bg-transparent' : 'bg-indigo-600'
                    }`}
                  />
                  <div className="flex-1">
                    {n.title && (
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                    )}
                    <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>{n.message}</p>
                    {n.createdAt?.toDate && (
                      <p className="mt-1 text-xs text-gray-400">{n.createdAt.toDate().toLocaleString()}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
