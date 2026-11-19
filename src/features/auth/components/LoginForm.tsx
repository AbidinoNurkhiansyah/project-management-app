"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { AuthCredentialsSchema } from "../schemas/auth.schema";
import { AuthMode } from "../types/auth.types";
import { GoogleIcon } from "./GoogleIcon";

export function LoginForm() {
  const router = useRouter();
  const {
    user,
    loading,
    error: authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/projects");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const parsed = AuthCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message || "Invalid credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(parsed.data.email, parsed.data.password);
      } else {
        await signUpWithEmail(parsed.data.email, parsed.data.password);
      }
      router.replace("/projects");
    } catch {
      // Error state is handled cleanly by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setValidationError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.replace("/projects");
    } catch {
      // Error state is handled cleanly by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setValidationError(null);
    clearError();
  };

  const activeError = validationError || authError;
  const isSignIn = mode === "signin";

  return (
    <div className="w-full max-w-sm border border-border bg-surface-card rounded-xl p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-sm text-zinc-100 mb-1">
          P
        </div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          {isSignIn ? "Sign in" : "Create account"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {isSignIn
            ? "Continue to your workspace"
            : "Set up your personal workspace"}
        </p>
      </div>

      {activeError && (
        <div
          role="alert"
          className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300"
        >
          {activeError}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
        className="w-full h-10 justify-center gap-2.5 bg-surface-elevated hover:bg-surface-hover border-border text-foreground"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="bg-surface-card px-2 text-[10px] uppercase font-mono tracking-wider text-muted-foreground absolute">
          or
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-email"
            className="text-xs font-medium text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-password"
            className="text-xs font-medium text-muted-foreground"
          >
            Password
          </label>
          <Input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />
        </div>

        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting}
          className="w-full h-10 justify-center mt-1 font-medium"
        >
          {isSubmitting
            ? "Please wait..."
            : isSignIn
            ? "Sign in"
            : "Create account"}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={toggleMode}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignIn ? (
            <>
              Don&apos;t have an account?{" "}
              <span className="text-blue-400 font-medium">Create one</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="text-blue-400 font-medium">Sign in</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
