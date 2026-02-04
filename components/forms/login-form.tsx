"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { authService } from "@/lib/api";
import { useAuth } from "@/components/auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setApiError(null);

    const response = await authService.login({
      email: data.email,
      password: data.password,
    });

    if (response.error) {
      setApiError(response.error);
      return;
    }

    if (!response.data?.success) {
      setApiError("Login failed. Please try again.");
      return;
    }

    // Refresh auth state and redirect to dashboard
    refreshAuth();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          disabled={isSubmitting}
          autoComplete="email"
          className="py-6"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            disabled={isSubmitting}
            autoComplete="current-password"
            className="py-6"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-start">
        <Link
          href="/forgot-password"
          className="text-sm font-bold text-foreground hover:text-foreground transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full rounded-full py-6" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

      <p className="text-center text-sm text-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
