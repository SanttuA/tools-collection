export type MarkdownStats = {
  characters: number;
  words: number;
};

type TableAlignment = 'center' | 'left' | 'right' | null;

const headingPattern = /^(#{1,6})\s+(.+?)\s*$/;
const headingClosingMarkerPattern = /\s+#+$/;
const horizontalRulePattern = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const fenceStartPattern = /^\s{0,3}```([A-Za-z0-9_-]+)?\s*$/;
const fenceEndPattern = /^\s{0,3}```\s*$/;
const unorderedListPattern = /^\s{0,3}[-*+]\s+(.+)$/;
const orderedListPattern = /^\s{0,3}\d+[.)]\s+(.+)$/;
const tableSeparatorPattern = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

export function renderMarkdown(input: string): string {
  if (!input.trim()) {
    return '';
  }

  return renderBlocks(input.replace(/\r\n?/g, '\n').split('\n')).join('\n');
}

export function getMarkdownStats(input: string): MarkdownStats {
  const trimmedInput = input.trim();

  return {
    characters: input.length,
    words: trimmedInput ? trimmedInput.split(/\s+/).length : 0,
  };
}

function renderBlocks(lines: string[]): string[] {
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(fenceStartPattern);
    if (fenceMatch) {
      const result = renderCodeFence(lines, index, fenceMatch[1]);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2].replace(headingClosingMarkerPattern, '');
      blocks.push(`<h${level}>${renderInline(content)}</h${level}>`);
      index += 1;
      continue;
    }

    if (horizontalRulePattern.test(line)) {
      blocks.push('<hr>');
      index += 1;
      continue;
    }

    if (line.match(/^\s{0,3}>\s?/)) {
      const result = renderBlockquote(lines, index);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (isTableStart(lines, index)) {
      const result = renderTable(lines, index);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const listMatch = getListMatch(line);
    if (listMatch) {
      const result = renderList(lines, index, listMatch.type);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const result = renderParagraph(lines, index);
    blocks.push(result.html);
    index = result.nextIndex;
  }

  return blocks;
}

function renderCodeFence(
  lines: string[],
  startIndex: number,
  language: string | undefined,
): { html: string; nextIndex: number } {
  const codeLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (fenceEndPattern.test(line)) {
      index += 1;
      break;
    }

    codeLines.push(line);
    index += 1;
  }

  const languageClass = language ? ` class="language-${escapeAttribute(language)}"` : '';

  return {
    html: `<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
    nextIndex: index,
  };
}

function renderBlockquote(
  lines: string[],
  startIndex: number,
): { html: string; nextIndex: number } {
  const quoteLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const quoteMatch = line.match(/^\s{0,3}>\s?(.*)$/);

    if (!quoteMatch) {
      break;
    }

    quoteLines.push(quoteMatch[1]);
    index += 1;
  }

  return {
    html: `<blockquote>${renderBlocks(quoteLines).join('\n')}</blockquote>`,
    nextIndex: index,
  };
}

function renderTable(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const headers = splitTableRow(lines[startIndex] ?? '');
  const alignments = splitTableRow(lines[startIndex + 1] ?? '').map(getTableAlignment);
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim() || !line.includes('|')) {
      break;
    }

    rows.push(splitTableRow(line));
    index += 1;
  }

  const headerCells = headers
    .map((header, cellIndex) => renderTableCell('th', header, alignments[cellIndex] ?? null))
    .join('');
  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((_, cellIndex) =>
          renderTableCell('td', row[cellIndex] ?? '', alignments[cellIndex] ?? null),
        )
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  return {
    html: `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`,
    nextIndex: index,
  };
}

function renderTableCell(tagName: 'td' | 'th', content: string, alignment: TableAlignment): string {
  const alignAttribute = alignment ? ` style="text-align: ${alignment}"` : '';

  return `<${tagName}${alignAttribute}>${renderInline(content.trim())}</${tagName}>`;
}

function renderList(
  lines: string[],
  startIndex: number,
  type: 'ol' | 'ul',
): { html: string; nextIndex: number } {
  const items: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const match = type === 'ul' ? line.match(unorderedListPattern) : line.match(orderedListPattern);

    if (!match) {
      break;
    }

    items.push(`<li>${renderInline(match[1])}</li>`);
    index += 1;
  }

  return {
    html: `<${type}>${items.join('')}</${type}>`,
    nextIndex: index,
  };
}

function renderParagraph(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const paragraphLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim() || isBlockStart(lines, index)) {
      break;
    }

    paragraphLines.push(line.trim());
    index += 1;
  }

  return {
    html: `<p>${renderInline(paragraphLines.join(' '))}</p>`,
    nextIndex: index,
  };
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? '';

  return (
    fenceStartPattern.test(line) ||
    headingPattern.test(line) ||
    horizontalRulePattern.test(line) ||
    /^\s{0,3}>\s?/.test(line) ||
    getListMatch(line) !== null ||
    isTableStart(lines, index)
  );
}

function isTableStart(lines: string[], index: number): boolean {
  const header = lines[index] ?? '';
  const separator = lines[index + 1] ?? '';

  return header.includes('|') && tableSeparatorPattern.test(separator);
}

function getListMatch(line: string): { type: 'ol' | 'ul' } | null {
  if (unorderedListPattern.test(line)) {
    return { type: 'ul' };
  }

  if (orderedListPattern.test(line)) {
    return { type: 'ol' };
  }

  return null;
}

function splitTableRow(line: string): string[] {
  const trimmedLine = line.trim().replace(/^\|/, '').replace(/\|$/, '');

  return trimmedLine.split('|');
}

function getTableAlignment(cell: string): TableAlignment {
  const trimmedCell = cell.trim();
  const startsAligned = trimmedCell.startsWith(':');
  const endsAligned = trimmedCell.endsWith(':');

  if (startsAligned && endsAligned) {
    return 'center';
  }

  if (startsAligned) {
    return 'left';
  }

  if (endsAligned) {
    return 'right';
  }

  return null;
}

function renderInline(input: string): string {
  let html = '';
  let lastIndex = 0;
  const codeSpanPattern = /`([^`\n]+)`/g;

  for (const match of input.matchAll(codeSpanPattern)) {
    html += renderInlineDecorations(input.slice(lastIndex, match.index));
    html += `<code>${escapeHtml(match[1])}</code>`;
    lastIndex = match.index + match[0].length;
  }

  html += renderInlineDecorations(input.slice(lastIndex));

  return html;
}

function renderInlineDecorations(input: string): string {
  let html = '';
  let lastIndex = 0;
  const linkPattern = /(!?)\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;

  for (const match of input.matchAll(linkPattern)) {
    html += renderEmphasis(input.slice(lastIndex, match.index));

    const isImage = match[1] === '!';
    const label = match[2];
    const url = match[3];

    if (isImage) {
      const imageUrl = sanitizeUrl(url, { allowMailto: false });
      html += imageUrl
        ? `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(label)}">`
        : renderEmphasis(match[0]);
    } else {
      const linkUrl = sanitizeUrl(url, { allowMailto: true });
      html += linkUrl
        ? `<a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noreferrer">${renderInline(
            label,
          )}</a>`
        : renderEmphasis(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  html += renderEmphasis(input.slice(lastIndex));

  return html;
}

function renderEmphasis(input: string): string {
  return escapeHtml(input)
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[\s([{])\*([^*\s][^*\n]*?)\*(?=$|[\s)\]}.,!?;:])/g, '$1<em>$2</em>')
    .replace(/(^|[\s([{])_([^_\s][^_\n]*?)_(?=$|[\s)\]}.,!?;:])/g, '$1<em>$2</em>');
}

function sanitizeUrl(url: string, options: { allowMailto: boolean }): string | null {
  const trimmedUrl = url.trim();

  if (!trimmedUrl || hasControlOrWhitespace(trimmedUrl)) {
    return null;
  }

  if (trimmedUrl.startsWith('//')) {
    return null;
  }

  const protocolMatch = trimmedUrl.match(/^([a-z][a-z\d+.-]*):/i);

  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    const allowedProtocols = options.allowMailto ? ['http', 'https', 'mailto'] : ['http', 'https'];

    return allowedProtocols.includes(protocol) ? trimmedUrl : null;
  }

  return trimmedUrl;
}

function hasControlOrWhitespace(value: string): boolean {
  for (const character of value) {
    const characterCode = character.charCodeAt(0);

    if (characterCode <= 32 || characterCode === 127) {
      return true;
    }
  }

  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
