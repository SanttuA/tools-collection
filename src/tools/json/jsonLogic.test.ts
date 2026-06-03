import { describe, expect, it } from 'vitest';

import { formatJson, minifyJson } from './jsonLogic';

describe('json logic', () => {
  it('formats valid JSON', () => {
    expect(formatJson('{"name":"Ada","items":[1,2]}')).toEqual({
      output: '{\n  "name": "Ada",\n  "items": [\n    1,\n    2\n  ]\n}',
      error: null,
    });
  });

  it('minifies valid JSON', () => {
    expect(minifyJson('{ "name": "Ada", "items": [1, 2] }')).toEqual({
      output: '{"name":"Ada","items":[1,2]}',
      error: null,
    });
  });

  it('reports parse errors without output', () => {
    const result = formatJson('{bad json');

    expect(result.output).toBe('');
    expect(result.error).toEqual(expect.any(String));
  });
});
