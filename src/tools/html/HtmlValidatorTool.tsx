import { Check, Copy, ScanSearch, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import {
  emptyHtmlValidationResult,
  validateHtml,
  type HtmlValidationResult,
} from './htmlValidation';

export function HtmlValidatorTool({ headingId }: ToolComponentProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<HtmlValidationResult>(emptyHtmlValidationResult);
  const [isValidating, setIsValidating] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const runValidation = async () => {
    setIsValidating(true);
    const validationResult = await validateHtml(input);
    setResult(validationResult);
    setIsValidating(false);
  };

  const clear = () => {
    setInput('');
    setResult(emptyHtmlValidationResult);
  };

  const status = getStatus(input, result, copied);

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Markup</p>
          <h1 id={headingId}>HTML Validator</h1>
          <p>Validate HTML markup locally without sending it to a remote service.</p>
        </div>
      </header>

      <div className="tool-panel">
        <div className="field-grid">
          <label className="field-block">
            <span className="field-label">HTML input</span>
            <textarea
              className="text-area"
              aria-label="HTML input"
              spellCheck={false}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </label>
          <label className="field-block">
            <span className="field-label">Validation report</span>
            <textarea
              className="text-area text-output"
              aria-label="Validation report"
              spellCheck={false}
              readOnly
              value={result.report}
            />
          </label>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="primary-button"
            disabled={isValidating}
            onClick={runValidation}
          >
            <ScanSearch aria-hidden="true" />
            {isValidating ? 'Validating HTML' : 'Validate HTML'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void copy(result.report)}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy report
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear HTML
          </button>
        </div>

        {result.error ? (
          <p className="error-banner" role="alert">
            {result.error}
          </p>
        ) : result.errorCount > 0 ? (
          <p className="error-banner" role="alert">
            HTML has {result.errorCount} {result.errorCount === 1 ? 'error' : 'errors'} and{' '}
            {result.warningCount} {result.warningCount === 1 ? 'warning' : 'warnings'}.
          </p>
        ) : (
          <p className={status.className} aria-live="polite">
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}

function getStatus(input: string, result: HtmlValidationResult, copied: boolean) {
  if (copied) {
    return {
      className: 'status-line success',
      message: 'Copied.',
    };
  }

  if (!input.trim() || !result.report) {
    return {
      className: 'status-line',
      message: '',
    };
  }

  if (result.warningCount > 0) {
    return {
      className: 'status-line',
      message: `HTML is valid with ${result.warningCount} ${
        result.warningCount === 1 ? 'warning' : 'warnings'
      }.`,
    };
  }

  return {
    className: 'status-line success',
    message: 'HTML is valid.',
  };
}
