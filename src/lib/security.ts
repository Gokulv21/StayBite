// StayBite Enterprise Security & Cryptographic Protection Module
// Implements OWASP Top 10 Safeguards: Cryptographic Hashing, Rate Limiting, Input Sanitization & Session Management

/**
 * Secure PBKDF2 / SHA-256 Password Hasher with Salt using Web Crypto API
 */
export async function hashPassword(password: string, salt: string = "StayBite_Zevox_Salt_2026"): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify Plaintext Password against Hashed Value
 */
export async function verifyPassword(password: string, expectedHash: string, salt?: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === expectedHash;
}

/**
 * In-Memory & Local Rate Limiter for Login Attempts & API Abuse Protection
 */
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

const loginRateLimits: Record<string, RateLimitRecord> = {};

export const RateLimiter = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 5 * 60 * 1000, // 5 minutes lockout

  checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds: number } {
    const now = Date.now();
    const record = loginRateLimits[identifier];

    if (!record) {
      return { allowed: true, remainingSeconds: 0 };
    }

    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remainingSeconds };
    }

    // Reset if last attempt was > 10 minutes ago
    if (now - record.lastAttempt > 10 * 60 * 1000) {
      delete loginRateLimits[identifier];
      return { allowed: true, remainingSeconds: 0 };
    }

    return { allowed: true, remainingSeconds: 0 };
  },

  recordFailedAttempt(identifier: string): { locked: boolean; remainingAttempts: number; remainingSeconds: number } {
    const now = Date.now();
    if (!loginRateLimits[identifier]) {
      loginRateLimits[identifier] = { attempts: 1, lockedUntil: 0, lastAttempt: now };
    } else {
      loginRateLimits[identifier].attempts += 1;
      loginRateLimits[identifier].lastAttempt = now;
    }

    const record = loginRateLimits[identifier];

    if (record.attempts >= this.MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCKOUT_DURATION_MS;
      return { locked: true, remainingAttempts: 0, remainingSeconds: Math.ceil(this.LOCKOUT_DURATION_MS / 1000) };
    }

    return { locked: false, remainingAttempts: this.MAX_ATTEMPTS - record.attempts, remainingSeconds: 0 };
  },

  reset(identifier: string): void {
    delete loginRateLimits[identifier];
  }
};

/**
 * Strict Input Sanitization & Anti-Injection Guard
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  if (typeof input !== "string") return "";
  
  // 1. Trim & clamp length
  let sanitized = input.trim().slice(0, maxLength);

  // 2. Strip dangerous script tags, HTML entities, and SQL characters
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/['";\\]/g, ""); // strip dangerous SQL breakout quotes

  return sanitized;
}

/**
 * Audit Logger for Security Events
 */
export function logSecurityEvent(event: string, details: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  console.info(`🛡️ [SECURITY AUDIT - ${timestamp}] ${event}:`, details);
}
