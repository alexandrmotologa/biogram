import crypto from "crypto";

/**
 * Validates Telegram Mini App initData using HMAC-SHA256.
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns the parsed user data if valid, null if the signature doesn't match.
 */
export function validateInitData(initData: string, botToken: string): TelegramUser | null {
  if (!initData || !botToken) return null;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    // Build the data-check-string: sort params alphabetically, exclude "hash"
    const entries: string[] = [];
    params.forEach((value, key) => {
      if (key !== "hash") {
        entries.push(`${key}=${value}`);
      }
    });
    entries.sort();
    const dataCheckString = entries.join("\n");

    // HMAC chain: secret = HMAC_SHA256("WebAppData", botToken), then HMAC_SHA256(secret, dataCheckString)
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (computedHash !== hash) return null;

    // Parse the user JSON from the validated data
    const userJson = params.get("user");
    if (!userJson) return null;

    const user = JSON.parse(userJson) as TelegramUser;
    return user;
  } catch {
    return null;
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Express/Fastify middleware-style auth extractor.
 * Reads initData from Authorization header and validates it.
 */
export function extractTelegramUser(authHeader: string | undefined, botToken: string): TelegramUser | null {
  if (!authHeader) return null;

  // Accept both "tma <initData>" and raw initData
  const initData = authHeader.startsWith("tma ") ? authHeader.slice(4) : authHeader;
  return validateInitData(initData, botToken);
}
