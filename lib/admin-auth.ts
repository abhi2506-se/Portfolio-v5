/**
 * admin-auth.ts
 * Auth utilities — credentials now read from the credentials store
 * (file-based, falls back to env vars on first run).
 */

import { getAdminCredentials } from './credentials-store'
const { username, password } = getAdminCredentials()

export const SESSION_COOKIE = 'portfolio_admin_session'
export const OTP_COOKIE     = 'portfolio_admin_otp'

export function generateToken(username: string): string {
  const payload = { username, ts: Date.now() }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    const isExpired = Date.now() - decoded.ts > 24 * 60 * 60 * 1000
    if (isExpired) return false

    const config = readConfig()
    return decoded.username === config.username
  } catch {
    return false
  }
}

export function checkCredentials(username: string, password: string): boolean {
  const config = readConfig()
  return (
    username === config.username &&
    verifyPassword(password, config.passwordHash, config.salt)
  )
}
