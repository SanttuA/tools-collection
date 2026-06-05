import { describe, expect, it } from 'vitest';

import { decodeJwt } from './jwtLogic';

const fixedNow = new Date('2026-06-05T00:00:00.000Z');
const tokenWithClaims =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNzAwMDAwMDAwLCJuYmYiOjE3MDAwMDAxMDAsImV4cCI6MjAwMDAwMDAwMH0.signature';
const tokenWithUrlSafePayload =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiLV8_IiwiZXhwIjoyMDAwMDAwMDAwfQ.sig';
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwMDAwMDB9.sig';

describe('jwt logic', () => {
  it('decodes a valid JWT', () => {
    const result = decodeJwt(tokenWithClaims, fixedNow);

    expect(result.error).toBeNull();
    expect(JSON.parse(result.headerJson)).toEqual({
      alg: 'HS256',
      typ: 'JWT',
    });
    expect(JSON.parse(result.payloadJson)).toEqual({
      sub: '123',
      name: 'Ada',
      iat: 1700000000,
      nbf: 1700000100,
      exp: 2000000000,
    });
    expect(result.signature).toBe('signature');
  });

  it('decodes URL-safe Base64 without padding', () => {
    const result = decodeJwt(tokenWithUrlSafePayload, fixedNow);

    expect(result.error).toBeNull();
    expect(JSON.parse(result.payloadJson)).toEqual({
      data: '-_?',
      exp: 2000000000,
    });
  });

  it('accepts a Bearer prefix', () => {
    const result = decodeJwt(`Bearer ${tokenWithClaims}`, fixedNow);

    expect(result.error).toBeNull();
    expect(JSON.parse(result.payloadJson)).toMatchObject({
      name: 'Ada',
    });
  });

  it('reports malformed segment counts', () => {
    const result = decodeJwt('only.two');

    expect(result.headerJson).toBe('');
    expect(result.payloadJson).toBe('');
    expect(result.error).toBe('JWT must have three dot-separated segments.');
  });

  it('reports invalid Base64URL segments', () => {
    const result = decodeJwt('****.eyJzdWIiOiIxMjMifQ.sig');

    expect(result.error).toBe('JWT header is not valid Base64URL.');
  });

  it('reports invalid JSON segments', () => {
    const result = decodeJwt('bm90LWpzb24.eyJzdWIiOiIxMjMifQ.sig');

    expect(result.error).toBe('JWT header is not valid JSON.');
  });

  it('summarizes registered time claims with a fixed clock', () => {
    const result = decodeJwt(tokenWithClaims, fixedNow);

    expect(result.claims).toEqual([
      {
        label: 'exp',
        message: 'Valid until 2033-05-18T03:33:20.000Z.',
        tone: 'success',
      },
      {
        label: 'nbf',
        message: 'Not valid before 2023-11-14T22:15:00.000Z.',
        tone: 'neutral',
      },
      {
        label: 'iat',
        message: 'Issued at 2023-11-14T22:13:20.000Z.',
        tone: 'neutral',
      },
    ]);
  });

  it('marks expired tokens', () => {
    const result = decodeJwt(expiredToken, fixedNow);

    expect(result.claims).toContainEqual({
      label: 'exp',
      message: 'Expired at 2023-11-14T22:13:20.000Z.',
      tone: 'warning',
    });
  });
});
