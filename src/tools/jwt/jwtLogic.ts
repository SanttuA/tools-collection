export type JwtClaimInsight = {
  label: string;
  message: string;
  tone: 'neutral' | 'success' | 'warning';
};

export type JwtDecodeResult = {
  headerJson: string;
  payloadJson: string;
  signature: string;
  claims: JwtClaimInsight[];
  error: string | null;
};

const textDecoder = new TextDecoder('utf-8', { fatal: true });
const base64UrlPattern = /^[A-Za-z0-9_-]*$/;

export function decodeJwt(input: string, now = new Date()): JwtDecodeResult {
  const token = normalizeJwtInput(input);

  if (!token) {
    return emptyJwtResult();
  }

  const segments = token.split('.');

  if (segments.length !== 3 || !segments[0] || !segments[1]) {
    return {
      ...emptyJwtResult(),
      error: 'JWT must have three dot-separated segments.',
    };
  }

  try {
    const header = decodeJsonSegment(segments[0], 'header');
    const payload = decodeJsonSegment(segments[1], 'payload');

    return {
      headerJson: JSON.stringify(header, null, 2),
      payloadJson: JSON.stringify(payload, null, 2),
      signature: segments[2],
      claims: summarizeClaims(payload, now),
      error: null,
    };
  } catch (error) {
    return {
      ...emptyJwtResult(),
      error: error instanceof Error ? error.message : 'JWT could not be decoded.',
    };
  }
}

function emptyJwtResult(): JwtDecodeResult {
  return {
    headerJson: '',
    payloadJson: '',
    signature: '',
    claims: [],
    error: null,
  };
}

function normalizeJwtInput(input: string): string {
  return input
    .trim()
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function decodeJsonSegment(segment: string, name: 'header' | 'payload'): unknown {
  const decoded = decodeBase64Url(segment, name);

  try {
    return JSON.parse(decoded) as unknown;
  } catch {
    throw new Error(`JWT ${name} is not valid JSON.`);
  }
}

function decodeBase64Url(segment: string, name: 'header' | 'payload'): string {
  if (!base64UrlPattern.test(segment) || segment.length % 4 === 1) {
    throw new Error(`JWT ${name} is not valid Base64URL.`);
  }

  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  try {
    const binary = globalThis.atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return textDecoder.decode(bytes);
  } catch {
    throw new Error(`JWT ${name} is not valid UTF-8 Base64URL.`);
  }
}

function summarizeClaims(payload: unknown, now: Date): JwtClaimInsight[] {
  if (!isRecord(payload)) {
    return [];
  }

  const claims = [
    summarizeExp(payload.exp, now),
    summarizeNbf(payload.nbf),
    summarizeIat(payload.iat),
  ];

  return claims.filter((claim): claim is JwtClaimInsight => claim !== null);
}

function summarizeExp(value: unknown, now: Date): JwtClaimInsight | null {
  const timestamp = numericDateToIso(value);

  if (!timestamp) {
    return null;
  }

  const expirationDate = new Date((value as number) * 1000);
  const isExpired = expirationDate.getTime() <= now.getTime();

  return {
    label: 'exp',
    message: isExpired ? `Expired at ${timestamp}.` : `Valid until ${timestamp}.`,
    tone: isExpired ? 'warning' : 'success',
  };
}

function summarizeNbf(value: unknown): JwtClaimInsight | null {
  const timestamp = numericDateToIso(value);

  if (!timestamp) {
    return null;
  }

  return {
    label: 'nbf',
    message: `Not valid before ${timestamp}.`,
    tone: 'neutral',
  };
}

function summarizeIat(value: unknown): JwtClaimInsight | null {
  const timestamp = numericDateToIso(value);

  if (!timestamp) {
    return null;
  }

  return {
    label: 'iat',
    message: `Issued at ${timestamp}.`,
    tone: 'neutral',
  };
}

function numericDateToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
