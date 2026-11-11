import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import * as AuthContextModule from "@/context/AuthContext";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner when auth is loading", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Authenticating session...")).toBeDefined();
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("redirects to /login when user is unauthenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("renders children when user is authenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { uid: "test-uid", email: "test@example.com" } as any,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeDefined();
  });
});
