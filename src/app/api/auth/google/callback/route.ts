import { NextRequest, NextResponse } from "next/server";
import {
  verifyOAuthState,
  completeGoogleOAuthCallback,
} from "@/features/integrations/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const state = stateParam ? verifyOAuthState(stateParam) : null;
  if (!state) {
    return NextResponse.redirect(
      new URL("/projects?gcal_error=invalid_state", request.url)
    );
  }

  const redirectBase =
    state.returnTo ||
    (state.projectId ? `/projects/${state.projectId}/settings` : "/schedule");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(
        `${redirectBase}?gcal_error=${encodeURIComponent(oauthError)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal_error=missing_code`, request.url)
    );
  }

  try {
    await completeGoogleOAuthCallback({ code, userId: state.userId });
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal=connected`, request.url)
    );
  } catch (err: unknown) {
    console.error("Google Calendar OAuth token exchange failed:", err);
    return NextResponse.redirect(
      new URL(`${redirectBase}?gcal_error=token_exchange_failed`, request.url)
    );
  }
}
