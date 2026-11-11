import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import * as AuthContextModule from "@/context/AuthContext";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  const mockSignInWithGoogle = vi.fn();
  const mockSignInWithEmail = vi.fn();
  const mockSignUpWithEmail = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail,
      logout: vi.fn(),
      clearError: mockClearError,
    });
  });

  it("renders sign in header, google button and email input", () => {
    render(<LoginPage />);

    expect(screen.getByText("Sign in to Workspace")).toBeDefined();
    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("switches to create account mode when link is clicked", () => {
    render(<LoginPage />);

    const switchBtn = screen.getByText("Create one");
    fireEvent.click(switchBtn);

    expect(screen.getByText("Create Workspace Account")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDefined();
  });

  it("triggers Google sign-in when Google button is clicked", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    const googleBtn = screen.getByText("Continue with Google");
    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("redirects to /projects when already authenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { uid: "user-1", email: "user@example.com" } as any,
      loading: false,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    render(<LoginPage />);
    expect(mockReplace).toHaveBeenCalledWith("/projects");
  });
});
