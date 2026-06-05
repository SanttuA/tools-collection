import { describe, expect, it } from 'vitest';

import { getMarkdownStats, renderMarkdown } from './markdownPreview';

describe('renderMarkdown', () => {
  it('renders common markdown blocks and inline formatting', () => {
    expect(
      renderMarkdown(
        [
          '# Notes',
          '',
          '**Strong** and *emphasis* with `code`.',
          '',
          '- One',
          '- [Docs](https://example.com/docs)',
          '',
          '```ts',
          'const ok = true;',
          '```',
        ].join('\n'),
      ),
    ).toBe(
      [
        '<h1>Notes</h1>',
        '<p><strong>Strong</strong> and <em>emphasis</em> with <code>code</code>.</p>',
        '<ul><li>One</li><li><a href="https://example.com/docs" target="_blank" rel="noreferrer">Docs</a></li></ul>',
        '<pre><code class="language-ts">const ok = true;</code></pre>',
      ].join('\n'),
    );
  });

  it('renders markdown tables', () => {
    expect(renderMarkdown(['| Name | Count |', '| --- | ---: |', '| Ada | 3 |'].join('\n'))).toBe(
      '<table><thead><tr><th>Name</th><th style="text-align: right">Count</th></tr></thead><tbody><tr><td>Ada</td><td style="text-align: right">3</td></tr></tbody></table>',
    );
  });

  it('preserves trailing heading hashes that are part of the text', () => {
    expect(renderMarkdown(['# C#', '## F#', '### C###'].join('\n'))).toBe(
      ['<h1>C#</h1>', '<h2>F#</h2>', '<h3>C###</h3>'].join('\n'),
    );
  });

  it('strips whitespace-separated closing heading hashes', () => {
    expect(renderMarkdown(['# Heading #', '## C# ###'].join('\n'))).toBe(
      ['<h1>Heading</h1>', '<h2>C#</h2>'].join('\n'),
    );
  });

  it('escapes raw HTML and unsafe URLs', () => {
    expect(
      renderMarkdown(
        '<script>alert("x")</script>\n\n[Run](javascript:alert(1))\n\n![Bad](data:image/svg+xml,boom)',
      ),
    ).toBe(
      '<p>&lt;script&gt;alert("x")&lt;/script&gt;</p>\n<p>[Run](javascript:alert(1))</p>\n<p>![Bad](data:image/svg+xml,boom)</p>',
    );
  });
});

describe('getMarkdownStats', () => {
  it('counts source words and characters', () => {
    expect(getMarkdownStats('Hello **markdown**')).toEqual({
      characters: 18,
      words: 2,
    });
  });
});
