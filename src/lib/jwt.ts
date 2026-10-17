// StayBite Long-Lived Cryptographic JWT Session Engine (Instagram/Mobile App Style)
// Generates and verifies HMAC-SHA256 signed JSON Web Tokens that persist indefinitely until explicit logout.

const JWT_SECRET = "staybite_zevox_jwt_secret_key_2026_enterprise_production";

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Generate a Cryptographic Long-Lived JWT Token for the User
 */
export async function createJwtToken(payload: {
  id: string;
  name: string;
  email: string;
  role: string;
}): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));

  const now = Math.floor(Date.now() / 1000);
  // Persistent 10-year expiration (Instagram/WhatsApp style persistent login)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 10 * 365 * 24 * 60 * 60,
    iss: "staybite.zevox.com"
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // Compute HMAC-SHA256 Signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, signatureData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureString = String.fromCharCode(...signatureArray);
  const encodedSignature = base64UrlEncode(signatureString);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify JWT Token Cryptographic Signature and Extract Payload
 */
export async function verifyJwtToken(token: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signatureBinary = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBinary.split("").map((c) => c.charCodeAt(0)));

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, signatureData);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    return payload;
  } catch {
    return null;
  }
}
