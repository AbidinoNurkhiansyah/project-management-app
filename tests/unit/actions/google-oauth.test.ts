import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAuthUrl } from "@/app/api/auth/google/url/route";
import { GET as handleCallback } from "@/app/api/auth/google/callback/route";

const mockGenerateAuthUrl = vi.fn().mockReturnValue("https://accounts.google.com/o/oauth2/auth?test=1");
const mockGetToken = vi.fn();
const mockFirestoreSet = vi.fn().mockResolvedValue({});

vi.mock("@/lib/google/calendar", () => ({
  getGoogleOAuth2Client: vi.fn(() => ({
    generateAuthUrl: mockGenerateAuthUrl,
    getToken: mockGetToken,
  })),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            set: mockFirestoreSet,
          })),
        })),
      })),
    })),
  })),
}));

vi.mock("@/lib/crypto", () => ({
  encryptToken: vi.fn(() => "encrypted-refresh-token"),
  decryptToken: vi.fn(() => "plain-refresh-token"),
}));

describe("Google OAuth Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TOKEN_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("generates redirect URL to Google consent screen", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/google/url?projectId=p1");
    const res = await getAuthUrl(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://accounts.google.com/o/oauth2/auth?test=1");
    expect(mockGenerateAuthUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        access_type: "offline",
        prompt: "consent",
      })
    );
  });

  it("redirects with error if OAuth returned error param", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/google/callback?error=access_denied&state=eyJwcm9qZWN0SWQiOiJwMSJ9");
    const res = await handleCallback(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("gcal_error=access_denied");
  });

  it("exchanges code for tokens, encrypts refresh_token, and saves to Firestore", async () => {
    mockGetToken.mockResolvedValueOnce({
      tokens: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expiry_date: 123456789,
        scope: "https://www.googleapis.com/auth/calendar.events",
      },
    });

    const stateParam = Buffer.from(JSON.stringify({ projectId: "p1", userId: "u1" })).toString("base64url");
    const req = new NextRequest(`http://localhost:3000/api/auth/google/callback?code=mock-code&state=${stateParam}`);
    const res = await handleCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/projects/p1/settings?gcal=connected");
    expect(mockFirestoreSet).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "mock-access-token",
        refreshToken: "encrypted-refresh-token",
      }),
      { merge: true }
    );
  });
});
