// Sesi demo berbasis localStorage.
// Backend integration point: ganti dengan Supabase Auth (getSession / signOut).
export type Role = 'admin' | 'owner';

export interface Session {
  role: Role;
  email: string;
  name: string;
}

const KEY = 'lineradss:session';

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

export const homeFor = (role: Role) => (role === 'owner' ? '/dashboard-owner' : '/dashboard-admin');
