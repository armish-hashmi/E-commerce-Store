import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// TEMPORARY diagnostic route — delete this file once notifications are confirmed working.
export async function GET() {
  try {
    const db = getAdminDb();

    const docRef = await db.collection('notifications').add({
      recipientType: 'admin',
      title: 'Debug Test',
      message: 'This is a test write from /api/debug-firebase',
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Firestore write succeeded! Check your notifications collection for a doc titled "Debug Test".',
      docId: docRef.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Firestore write failed. See error details below.',
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}