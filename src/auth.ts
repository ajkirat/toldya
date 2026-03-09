export interface AuthState {
  uid: string;       // Google 'sub' — stable, unique per Google account
  email: string;
  name: string;
  picture: string;
}

const AUTH_KEY = 'toldya_auth';

export function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

/** Per-user game state storage key */
export function gameStorageKey(uid: string): string {
  return `predictx_v1_${uid}`;
}
