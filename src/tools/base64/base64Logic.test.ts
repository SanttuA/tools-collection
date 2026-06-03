import { describe, expect, it } from 'vitest';

import { decodeBase64, encodeBase64 } from './base64Logic';

describe('base64 logic', () => {
  it('encodes UTF-8 text', () => {
    expect(encodeBase64('Hello world')).toEqual({
      output: 'SGVsbG8gd29ybGQ=',
      error: null,
    });
  });

  it('decodes UTF-8 base64 text', () => {
    expect(decodeBase64('SGVsbG8gd29ybGQ=')).toEqual({
      output: 'Hello world',
      error: null,
    });
  });

  it('reports invalid base64 input', () => {
    const result = decodeBase64('not valid ***');

    expect(result.output).toBe('');
    expect(result.error).toBe('Input is not valid UTF-8 Base64.');
  });
});
