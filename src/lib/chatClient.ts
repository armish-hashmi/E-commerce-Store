import { io, Socket } from 'socket.io-client';

const CHAT_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL as string;

export async function getChatToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/chat/token');
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
}

export function connectChatSocket(token: string): Socket {
  return io(CHAT_SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
  });
}

export async function fetchChatJson(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${CHAT_SERVER_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Chat request failed');
  return data;
}
