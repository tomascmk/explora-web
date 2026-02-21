import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || ''

export function encryptPassword(password: string): string {
  if (!ENCRYPTION_KEY) {
    console.warn('[crypto] NEXT_PUBLIC_ENCRYPTION_KEY not set — password sent without encryption')
    return password
  }
  const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
  return `enc:${encrypted}`
}
