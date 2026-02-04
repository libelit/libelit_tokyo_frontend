"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      const isUserAuthenticated = authService.isAuthenticated();

      if (!isPublicRoute && !isUserAuthenticated) {
        // Not authenticated and trying to access protected route
        router.push("/login");
        return;
      }

      if (isPublicRoute && isUserAuthenticated) {
        // Already authenticated and trying to access public route (login/register)
        router.push("/dashboard");
        return;
      }

      setIsAuthenticated(isUserAuthenticated || isPublicRoute);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (!isAuthenticated && !publicRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return <>{children}</>;
}
