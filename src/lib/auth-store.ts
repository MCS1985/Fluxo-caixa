import { useEffect, useSyncExternalStore } from "react";

type AuthState = {
  authenticated: boolean;
  username: string;
};

const STORAGE_KEY = "fluxo-auth:v1";
const HASH_KEY = "fluxo-auth:hash";
const USER_KEY = "fluxo-auth:user";

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin";

function hashPass(pass: string): string {
  return btoa(pass);
}

function getStoredHash(): string | null {
  try {
    return localStorage.getItem(HASH_KEY);
  } catch {
    return null;
  }
}

function setStoredHash(h: string) {
  try {
    localStorage.setItem(HASH_KEY, h);
  } catch {
    /* localStorage indisponível */
  }
}

function getStoredUser(): string {
  try {
    return localStorage.getItem(USER_KEY) || DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

function setStoredUser(u: string) {
  try {
    localStorage.setItem(USER_KEY, u);
  } catch {
    /* localStorage indisponível */
  }
}

if (typeof window !== "undefined" && !getStoredHash()) {
  setStoredHash(hashPass(DEFAULT_PASS));
  setStoredUser(DEFAULT_USER);
}

let authState: AuthState = (() => {
  if (typeof window === "undefined") {
    return { authenticated: false, username: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* localStorage indisponível */
  }
  return { authenticated: false, username: "" };
})();

const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch {
      /* localStorage indisponível */
    }
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return authState;
}

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const authActions = {
  login(username: string, password: string): boolean {
    const storedHash = getStoredHash();
    const storedUser = getStoredUser();
    if (storedHash === hashPass(password) && storedUser === username) {
      authState = { authenticated: true, username };
      emit();
      return true;
    }
    return false;
  },

  logout() {
    authState = { authenticated: false, username: "" };
    localStorage.removeItem(STORAGE_KEY);
    emit();
  },

  changePassword(currentPass: string, newPass: string): boolean {
    const storedHash = getStoredHash();
    if (storedHash !== hashPass(currentPass)) return false;
    setStoredHash(hashPass(newPass));
    return true;
  },

  changeUsername(currentPass: string, newUser: string): boolean {
    const storedHash = getStoredHash();
    if (storedHash !== hashPass(currentPass)) return false;
    setStoredUser(newUser);
    authState = { ...authState, username: newUser };
    emit();
    return true;
  },
};

export function useHydrateAuth() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        authState = parsed;
      }
    } catch {
      /* localStorage indisponível */
    }
    emit();
  }, []);
}
