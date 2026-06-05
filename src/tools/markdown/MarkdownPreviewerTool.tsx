import { Check, Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import { getMarkdownStats, renderMarkdown } from './markdownPreview';

export function MarkdownPreviewerTool({ headingId }: ToolComponentProps) {
  const [input, setInput] = useState('');
  const { copied, copy } = useCopyToClipboard();
  const previewHtml = useMemo(() => renderMarkdown(input), [input]);
  const stats = useMemo(() => getMarkdownStats(input), [input]);

  const clear = () => {
    setInput('');
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Markup</p>
          <h1 id={headingId}>Markdown Previewer</h1>
          <p>Write markdown and preview sanitized HTML locally.</p>
        </div>
      </header>

      <div className="tool-panel">
        <div className="field-grid">
          <label className="field-block">
            <span className="field-label">Markdown input</span>
            <textarea
              className="text-area"
              aria-label="Markdown input"
              spellCheck={false}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={'# Release notes\n\n- Added a new thing\n- Fixed `inline code`'}
            />
          </label>

          <div className="field-block">
            <span className="field-label" id="markdown-preview-label">
              Markdown preview
            </span>
            <section className="markdown-preview" aria-labelledby="markdown-preview-label">
              {previewHtml ? (
                <div
                  className="markdown-preview-content"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="markdown-preview-empty">Preview appears here.</p>
              )}
            </section>
          </div>
        </div>

        <div className="action-row">
          <button type="button" className="secondary-button" onClick={() => void copy(previewHtml)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy HTML
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear markdown
          </button>
        </div>

        <p className={copied ? 'status-line success' : 'status-line'} aria-live="polite">
          {copied
            ? 'Copied HTML.'
            : `${stats.words} ${stats.words === 1 ? 'word' : 'words'}, ${stats.characters} ${
                stats.characters === 1 ? 'character' : 'characters'
              }.`}
        </p>
      </div>
    </div>
  );
}
