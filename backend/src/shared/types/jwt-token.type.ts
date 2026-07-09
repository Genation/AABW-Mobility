/**
 * JWT Token Type
 * @description The type for JWT tokens
 * @example const jwtToken: JwtToken = {
 *   iss: "https://example.com",
 *   sub: "1234567890",
 *   aud: ["https://example.com"],
 *   exp: 1716153600,
 *   nbf: 1716153600,
 *   iat: 1716153600,
 *   jti: "1234567890",
 *   role: "user",
 *   client_id: "1234567890",
 *   [key: string]: unknown,
 * }
 */
export type JwtToken = {
  /** Issuer claim */
  iss?: string;
  /** Subject claim (User ID) */
  sub?: string;
  /** Audience claim */
  aud?: string[] | string;
  /** Expiration time */
  exp?: number;
  /** Not Before time */
  nbf?: number;
  /** Issued At time */
  iat?: number;
  /** JWT ID */
  jti?: string;
  /** User Role */
  role?: string;
  /** OAuth Client ID (if applicable) */
  client_id?: string;
  /** Additional claims */
  [key: string]: unknown;
};
