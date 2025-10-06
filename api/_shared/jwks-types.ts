// Local JWKS types for authentication compatible with jose library
export interface JWK {
  kty: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  'x5t#S256'?: string;
  [key: string]: unknown;
}

export interface LocalJWKSet {
  keys: JWK[];
}