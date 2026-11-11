import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "default";
    const userId = searchParams.get("userId") || "user-1";

    const statePayload = Buffer.from(
      JSON.stringify({ projectId, userId })
    ).toString("base64url");

    const oauth2Client = getGoogleOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      state: statePayload,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Failed to generate Google OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to initialize Google OAuth flow" },
      { status: 500 }
    );
  }
}
