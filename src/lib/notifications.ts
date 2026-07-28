import { getAdminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface NotificationPayload {
  message: string;
  email?: string;
  title?: string;
  orderId?: string;
}

export async function notifyAdmin({
  title,
  message,
  orderId,
}: Omit<NotificationPayload, 'email'>) {
  try {
    const db = getAdminDb();
    await db.collection('notifications').add({
      recipientType: 'admin',
      title,
      message,
      ...(orderId && { orderId }),
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write admin notification:', err);
  }
}

export async function notifyUser(
  email: string,
  { title, message, orderId }: NotificationPayload
) {
  if (!email) return;
  try {
    const db = getAdminDb();
    await db.collection('notifications').add({
      recipientType: 'user',
      recipientEmail: email.toLowerCase().trim(),
      title,
      message,
      ...(orderId && { orderId }),
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write user notification:', err);
  }
}