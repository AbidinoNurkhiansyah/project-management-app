import { NextRequest, NextResponse } from "next/server";
import {
  GoogleOAuthStartSchema,
  buildGoogleConsentUrl,
} from "@/features/integrations/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = GoogleOAuthStartSchema.safeParse({
    projectId: searchParams.get("projectId") || undefined,
    returnTo: searchParams.get("returnTo") || undefined,
    userId: searchParams.get("userId") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid Google OAuth parameters" },
      { status: 400 }
    );
  }

  try {
    const authUrl = buildGoogleConsentUrl(parsed.data);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Failed to generate Google OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to initialize Google OAuth flow" },
      { status: 500 }
    );
  }
}
