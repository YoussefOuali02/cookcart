"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/auth-storage";
import type { LoginInput, RegisterInput, SafeUser } from "@/types/api";

interface AuthContextValue {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStoredSession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.me(storedToken);
        if (!cancelled) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch {
        clearStoredToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStoredSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuthResult = useCallback(
    (result: { accessToken: string; user: SafeUser }) => {
      setStoredToken(result.accessToken);
      setToken(result.accessToken);
      setUser(result.user);
    },
    [],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await api.login(input);
      applyAuthResult(result);
    },
    [applyAuthResult],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await api.register(input);
      applyAuthResult(result);
    },
    [applyAuthResult],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/** Redirects to /login once the auth state has resolved and no user is signed in. */
export function useRequireAuth(): AuthContextValue {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/login");
    }
  }, [auth.isLoading, auth.user, router]);

  return auth;
}
