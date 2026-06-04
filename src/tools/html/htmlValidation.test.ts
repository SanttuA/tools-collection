import { describe, expect, it } from 'vitest';

import { validateHtml } from './htmlValidation';

const validDocument =
  '<!DOCTYPE html><html lang="en"><head><title>Valid</title></head><body><main><h1>Valid</h1></main></body></html>';

describe('html validation logic', () => {
  it('returns no issues for valid HTML', async () => {
    await expect(validateHtml(validDocument)).resolves.toEqual({
      error: null,
      errorCount: 0,
      issues: [],
      report: 'No HTML validation issues found.',
      valid: true,
      warningCount: 0,
    });
  });

  it('reports invalid void element closing tags', async () => {
    const result = await validateHtml(
      '<!DOCTYPE html><html lang="en"><head><title>Bad</title></head><body><input type="text"></input></body></html>',
    );

    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'void-content',
          severity: 'error',
        }),
      ]),
    );
    expect(result.report).toContain('void-content');
  });

  it('reports raw characters that should be encoded', async () => {
    const result = await validateHtml(
      '<!DOCTYPE html><html lang="en"><head><title>Bad</title></head><body><h1>Hello & goodbye</h1></body></html>',
    );

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'no-raw-characters',
          severity: 'error',
        }),
      ]),
    );
  });

  it('returns a clean empty result for empty input', async () => {
    const result = await validateHtml('   ');

    expect(result).toEqual({
      error: null,
      errorCount: 0,
      issues: [],
      report: '',
      valid: true,
      warningCount: 0,
    });
  });
});
