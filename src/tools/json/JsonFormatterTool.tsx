import { Check, Copy, Minimize2, Trash2, WandSparkles } from 'lucide-react';
import { useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import { formatJson, minifyJson } from './jsonLogic';

export function JsonFormatterTool({ headingId }: ToolComponentProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const runFormatter = () => {
    const result = formatJson(input);
    setOutput(result.output);
    setError(result.error);
  };

  const runMinifier = () => {
    const result = minifyJson(input);
    setOutput(result.output);
    setError(result.error);
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Data</p>
          <h1 id={headingId}>JSON Formatter</h1>
          <p>Validate, pretty-print, and minify JSON input.</p>
        </div>
      </header>

      <div className="tool-panel">
        <div className="field-grid">
          <label className="field-block">
            <span className="field-label">JSON input</span>
            <textarea
              className="text-area"
              aria-label="JSON input"
              spellCheck={false}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <label className="field-block">
            <span className="field-label">JSON output</span>
            <textarea
              className="text-area text-output"
              aria-label="JSON output"
              spellCheck={false}
              readOnly
              value={output}
            />
          </label>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={runFormatter}>
            <WandSparkles aria-hidden="true" />
            Format JSON
          </button>
          <button type="button" className="secondary-button" onClick={runMinifier}>
            <Minimize2 aria-hidden="true" />
            Minify JSON
          </button>
          <button type="button" className="secondary-button" onClick={() => void copy(output)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy JSON output
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear JSON
          </button>
        </div>

        {error ? (
          <p className="error-banner" role="alert">
            {error}
          </p>
        ) : (
          <p className={copied ? 'status-line success' : 'status-line'} aria-live="polite">
            {copied ? 'Copied.' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
