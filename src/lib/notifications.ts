import { getAdminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function notifyAdmin(message: string, orderId: string) {
  try {
    const db = getAdminDb();
    await db.collection('notifications').add({
      recipientType: 'admin',
      message,
      orderId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write admin notification:', err);
  }
}

export async function notifyUser(email: string, message: string, orderId: string) {
  if (!email) return;
  try {
    const db = getAdminDb();
    await db.collection('notifications').add({
      recipientType: 'user',
      recipientEmail: email,
      message,
      orderId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write user notification:', err);
  }
}