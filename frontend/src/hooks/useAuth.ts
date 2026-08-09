import { useState, useEffect } from 'react';
 

const TOKEN_KEY = 'token';
 
export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  role?: 'student' | 'instructor' | 'admin';
}
 
interface UseAuthResult {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}
 

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
 
export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
 
  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
 
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
 
    const payload = decodeJwtPayload(storedToken);
 
    if (!payload) {
      // token is malformed/corrupted — clear it rather than leave the
      // app in a half-authenticated state
      window.localStorage.removeItem(TOKEN_KEY);
      setIsLoading(false);
      return;
    }
 
    setToken(storedToken);
    setUser({
      id: String(payload.id ?? payload.userId ?? payload.sub ?? ''),
      name: typeof payload.name === 'string' ? payload.name : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? (payload.role as AuthUser['role']) : undefined,
    });
    setIsLoading(false);
  }, []);
 
  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }
 
  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
};
 