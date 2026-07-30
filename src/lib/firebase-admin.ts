import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getPrivateKey(): string | undefined {
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64Key) {
    return Buffer.from(base64Key, 'base64').toString('utf8');
  }
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) {
    return existing[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}