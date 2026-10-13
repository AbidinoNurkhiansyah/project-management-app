import { describe, it, expect } from "vitest";
import { getFirebaseApp } from "@/lib/firebase/client";

describe("Firebase client config", () => {
  it("initializes without throwing when config is present", () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "dummy-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "dummy.firebaseapp.com";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "dummy-project";
    expect(() => getFirebaseApp()).not.toThrow();
  });
});
