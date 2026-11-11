import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseAuth: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

function Consumer() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading-state">{loading ? "loading" : "idle"}</span>
      <span data-testid="user-state">{user ? "authenticated" : "anonymous"}</span>
    </div>
  );
}

describe("AuthContext & AuthProvider", () => {
  it("provides initial state through useAuth hook", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading-state").textContent).toBe("idle");
    expect(screen.getByTestId("user-state").textContent).toBe("anonymous");
  });
});
