import React, { createContext, useCallback, useContext, useState } from "react";
import type { AuthUser } from "@/services/auth";
import { clearAuthToken, setAuthToken, setAuthUser } from "@/services/authSession";

type AuthContextValue = {
  user: AuthUser | null;
  login: (token: string, user: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((token: string, authUser: AuthUser | null) => {
    setAuthToken(token);
    setAuthUser(authUser);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
