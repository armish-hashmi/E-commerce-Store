'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface NotificationDoc {
  id: string;
  message: string;
  orderId: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationBell({
  recipientType,
  recipientEmail,
}: {
  recipientType: 'admin' | 'user';
  recipientEmail?: string | null;
}) {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipientType === 'user' && !recipientEmail) {
      setNotifications([]);
      return;
    }

    const q =
      recipientType === 'admin'
        ? query(
            collection(db, 'notifications'),
            where('recipientType', '==', 'admin'),
            orderBy('createdAt', 'desc')
          )
        : query(
            collection(db, 'notifications'),
            where('recipientType', '==', 'user'),
            where('recipientEmail', '==', recipientEmail),
            orderBy('createdAt', 'desc')
          );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as NotificationDoc)
        );
        setNotifications(items.slice(0, 20));
      },
      (err) => {
        console.error('Notification listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [recipientType, recipientEmail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold h-4 w-4">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${
                    n.read ? 'text-gray-500' : 'text-gray-900 bg-indigo-50/40 font-medium'
                  }`}
                >
                  {n.message}
                  {n.createdAt?.toDate && (
                    <div className="mt-1 text-xs text-gray-400 font-normal">
                      {n.createdAt.toDate().toLocaleString()}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
