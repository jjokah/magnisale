import { decodeIdToken, Google } from "arctic";
import type { Env } from "../env.js";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

/** The two calls the sign-in flow needs, so tests never reach Google. */
export interface GoogleAuth {
  authorizationUrl(state: string, codeVerifier: string): URL;
  exchange(code: string, codeVerifier: string): Promise<GoogleIdentity>;
}

export function createGoogleAuth(env: Env): GoogleAuth | null {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;

  const google = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    new URL("/api/v1/auth/google/callback", env.APP_URL).toString(),
  );

  return {
    authorizationUrl: (state, codeVerifier) =>
      google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]),

    async exchange(code, codeVerifier) {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      // Received directly from Google over TLS, so the signature need not be rechecked.
      const claims = decodeIdToken(tokens.idToken()) as {
        sub: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
      };
      if (!claims.email) throw new Error("Google did not return an email address.");
      return {
        sub: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true,
        name: claims.name?.trim() || claims.email.split("@")[0]!,
      };
    },
  };
}
