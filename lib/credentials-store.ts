/**
 * credentials-store.ts
 * Reads and writes admin credentials to /data/admin-config.json
 * Falls back to env vars when the file doesn't exist yet.
 *
 * ⚠️  On Vercel (serverless) file writes are ephemeral.
 *     After changing credentials they persist for the lifetime of the deployment.
 *     For permanent persistence across re-deploys, switch to a database or
 *     update the environment variables directly in the Vercel dashboard.
 */

import { createHash, randomBytes, pbkdf2Sync } from 'crypto'




export interface AdminConfig {
  username: string
  passwordHash: string
  salt: string
  email: string
}

// ── Hashing helpers ────────────────────────────────────────────────────────────

export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
}

export function generateSalt(): string {
  return randomBytes(32).toString('hex')
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt) === hash
}

// ── HMAC helpers for OTP cookie signing ───────────────────────────────────────

const SIGN_SECRET = process.env.SESSION_SECRET || 'portfolio-admin-otp-secret-2024'

export function signPayload(payload: string): string {
  return createHash('sha256').update(payload + SIGN_SECRET).digest('hex')
}

export function verifySignature(payload: string, sig: string): boolean {
  return signPayload(payload) === sig
}

// ── Config file I/O ────────────────────────────────────────────────────────────

function ensureDataDir() {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  }
}

