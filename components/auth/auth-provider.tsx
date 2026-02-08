"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const currentUser = authService.getUser();
    const isAuth = authService.isAuthenticated();

    if (isAuth && currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);

    // Clear demo data on logout
    localStorage.removeItem("libelit_loan_proposals");
    localStorage.removeItem("libelit_proposals_seeded");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
