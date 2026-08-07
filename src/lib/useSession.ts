'use client';

import { useEffect, useState } from 'react';

export interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
}

let cachedUser: SessionUser | null | undefined; 
let inFlight: Promise<SessionUser | null> | null = null;

async function fetchSession(): Promise<SessionUser | null> {
  if (cachedUser !== undefined) return cachedUser;
  if (!inFlight) {
    inFlight = fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        cachedUser = data.user || null;
        return cachedUser;
      })
      .catch(() => {
        cachedUser = null;
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function invalidateSession() {
  cachedUser = undefined;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(cachedUser);
  const [loading, setLoading] = useState(cachedUser === undefined);

  useEffect(() => {
    let mounted = true;
    fetchSession().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { user: user ?? null, isLoggedIn: !!user, isAdmin: user?.role === 'admin', loading };
}