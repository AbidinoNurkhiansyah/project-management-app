import { describe, it, expect } from "vitest";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";

describe("getGoogleOAuth2Client", () => {
  it("initializes OAuth2 client with redirect URI", () => {
    process.env.GOOGLE_CLIENT_ID = "g-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "g-client-secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";
    const client = getGoogleOAuth2Client();
    expect(client).toBeDefined();
  });
});
