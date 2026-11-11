import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { encryptToken } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  let projectId = "default";
  let userId = "user-1";

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (decoded.projectId) projectId = decoded.projectId;
      if (decoded.userId) userId = decoded.userId;
    } catch (e) {
      console.warn("Failed to decode OAuth state parameter:", e);
    }
  }

  const redirectBase = `/projects/${projectId}/settings`;

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal_error=${encodeURIComponent(oauthError)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal_error=Missing+authorization+code`, request.url)
    );
  }

  try {
    const oauth2Client = getGoogleOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const secretKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (!secretKey) {
      throw new Error("Missing TOKEN_ENCRYPTION_KEY configuration in environment");
    }

    const refreshTokenRaw = tokens.refresh_token || "";
    const encryptedRefreshToken = refreshTokenRaw
      ? encryptToken(refreshTokenRaw, secretKey)
      : "";

    const db = getAdminFirestore();
    await db
      .collection("users")
      .doc(userId)
      .collection("integrations")
      .doc("google")
      .set(
        {
          accessToken: tokens.access_token || "",
          ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
          expiryDate: tokens.expiry_date || 0,
          scope: tokens.scope || "https://www.googleapis.com/auth/calendar.events",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal=connected`, request.url)
    );
  } catch (err: unknown) {
    console.error("Google Calendar OAuth token exchange failed:", err);
    const message = err instanceof Error ? err.message : "Token exchange error";
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal_error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
