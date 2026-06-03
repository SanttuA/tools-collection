import { ArrowLeftRight, Check, Copy, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import { decodeBase64, encodeBase64 } from './base64Logic';

export function Base64ConverterTool({ headingId }: ToolComponentProps) {
  const [plainText, setPlainText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const encode = () => {
    const result = encodeBase64(plainText);
    setEncodedText(result.output);
    setError(result.error);
  };

  const decode = () => {
    const result = decodeBase64(encodedText);
    setPlainText(result.output);
    setError(result.error);
  };

  const swap = () => {
    setPlainText(encodedText);
    setEncodedText(plainText);
    setError(null);
  };

  const clear = () => {
    setPlainText('');
    setEncodedText('');
    setError(null);
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Encoding</p>
          <h1 id={headingId}>Base64 Converter</h1>
          <p>Encode and decode UTF-8 text.</p>
        </div>
      </header>

      <div className="tool-panel">
        <div className="field-grid">
          <label className="field-block">
            <span className="field-label">Plain text</span>
            <textarea
              className="text-area"
              aria-label="Plain text"
              value={plainText}
              onChange={(event) => setPlainText(event.target.value)}
            />
          </label>
          <label className="field-block">
            <span className="field-label">Base64 text</span>
            <textarea
              className="text-area text-output"
              aria-label="Base64 text"
              spellCheck={false}
              value={encodedText}
              onChange={(event) => setEncodedText(event.target.value)}
            />
          </label>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={encode}>
            <RotateCcw aria-hidden="true" />
            Encode to Base64
          </button>
          <button type="button" className="secondary-button" onClick={decode}>
            <RotateCcw aria-hidden="true" />
            Decode from Base64
          </button>
          <button type="button" className="secondary-button" onClick={swap}>
            <ArrowLeftRight aria-hidden="true" />
            Swap values
          </button>
          <button type="button" className="secondary-button" onClick={() => void copy(encodedText)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy Base64 text
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear Base64
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
