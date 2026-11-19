import crypto from "crypto";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { encryptToken } from "@/lib/crypto";
import {
  GoogleOAuthStartInput,
  GoogleOAuthStatePayload,
  GoogleOAuthStatePayloadSchema,
} from "../schemas/google-oauth.schema";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const STATE_TTL_MS = 10 * 60 * 1000;

function getSigningSecret(): string {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("Missing TOKEN_ENCRYPTION_KEY configuration");
  }
  return secret;
}

export function signOAuthState(input: GoogleOAuthStartInput): string {
  const payload: GoogleOAuthStatePayload = {
    projectId: input.projectId,
    userId: input.userId,
    exp: Date.now() + STATE_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyOAuthState(state: string): GoogleOAuthStatePayload | null {
  const parts = state.split(".");
  if (parts.length !== 2) return null;

  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig, "utf-8");
  const expectedBuf = Buffer.from(expectedSig, "utf-8");
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const raw = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    const parsed = GoogleOAuthStatePayloadSchema.safeParse(raw);
    if (!parsed.success) return null;
    if (parsed.data.exp < Date.now()) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function buildGoogleConsentUrl(input: GoogleOAuthStartInput): string {
  const state = signOAuthState(input);
  const oauth2Client = getGoogleOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [CALENDAR_SCOPE],
    state,
  });
}

export async function completeGoogleOAuthCallback(params: {
  code: string;
  userId: string;
}): Promise<void> {
  const oauth2Client = getGoogleOAuth2Client();
  const { tokens } = await oauth2Client.getToken(params.code);

  const secretKey = getSigningSecret();
  const encryptedRefreshToken = tokens.refresh_token
    ? encryptToken(tokens.refresh_token, secretKey)
    : "";

  const db = getAdminFirestore();
  await db
    .collection("users")
    .doc(params.userId)
    .collection("integrations")
    .doc("google")
    .set(
      {
        accessToken: tokens.access_token || "",
        ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
        expiryDate: tokens.expiry_date || 0,
        scope: tokens.scope || CALENDAR_SCOPE,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
}
