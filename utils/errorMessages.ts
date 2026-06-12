const SAFE_ERROR_MAP: Record<string, string> = {
  EMAIL_IN_USE: 'Email already in use',
  INVALID_CREDENTIALS: 'Invalid email or password',
  NOT_FOUND: 'Resource not found',
  UNAUTHENTICATED: 'Session expired, please log in again',
  FORBIDDEN: 'You don\u2019t have permission to do this',
}

const PASS_THROUGH_CODES = new Set(['BAD_USER_INPUT'])

/**
 * Extract a user-safe error message from a GraphQL error.
 * Whitelisted codes pass through; everything else gets a generic message.
 */
export function getDisplayError(error: unknown): string {
  const DEFAULT = 'Something went wrong. Please try again.'

  if (!error || typeof error !== 'object') return DEFAULT

  // Apollo GraphQL error shape
  const graphQLErrors = (error as Record<string, unknown>).graphQLErrors as
    | Array<{ extensions?: { code?: string }; message?: string }>
    | undefined

  if (graphQLErrors && graphQLErrors.length > 0) {
    const firstError = graphQLErrors[0]
    const code = firstError.extensions?.code

    if (code && SAFE_ERROR_MAP[code]) {
      return SAFE_ERROR_MAP[code]
    }

    if (code && PASS_THROUGH_CODES.has(code) && firstError.message) {
      return firstError.message
    }

    return DEFAULT
  }

  // Generic Error
  if ('message' in error && typeof (error as Error).message === 'string') {
    const message = (error as Error).message

    // Check if the message matches a known safe pattern
    for (const safeMsg of Object.values(SAFE_ERROR_MAP)) {
      if (message.includes(safeMsg)) return safeMsg
    }

    return DEFAULT
  }

  return DEFAULT
}
