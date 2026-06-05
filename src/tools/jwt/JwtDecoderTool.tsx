import { Check, Copy, ScanText, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import { decodeJwt, type JwtDecodeResult } from './jwtLogic';

const emptyResult: JwtDecodeResult = {
  headerJson: '',
  payloadJson: '',
  signature: '',
  claims: [],
  error: null,
};

export function JwtDecoderTool({ headingId }: ToolComponentProps) {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<JwtDecodeResult>(emptyResult);
  const { copied, copy } = useCopyToClipboard();

  const runDecoder = () => {
    setResult(decodeJwt(token));
  };

  const clear = () => {
    setToken('');
    setResult(emptyResult);
  };

  const decodedOutput = [result.headerJson, result.payloadJson].filter(Boolean).join('\n\n');
  const status = getStatus(token, result, copied);

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Security</p>
          <h1 id={headingId}>JWT Decoder</h1>
          <p>Decode JWT header, payload, and registered time claims locally.</p>
        </div>
      </header>

      <div className="tool-panel">
        <label className="field-block">
          <span className="field-label">JWT token</span>
          <textarea
            className="text-area jwt-token-input"
            aria-label="JWT token"
            spellCheck={false}
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <div className="field-grid jwt-output-grid">
          <label className="field-block">
            <span className="field-label">Decoded header</span>
            <textarea
              className="text-area text-output"
              aria-label="Decoded header"
              spellCheck={false}
              readOnly
              value={result.headerJson}
            />
          </label>
          <label className="field-block">
            <span className="field-label">Decoded payload</span>
            <textarea
              className="text-area text-output"
              aria-label="Decoded payload"
              spellCheck={false}
              readOnly
              value={result.payloadJson}
            />
          </label>
        </div>

        <div className="jwt-details-grid">
          <section className="jwt-detail-panel" aria-labelledby="jwt-claims-heading">
            <h2 id="jwt-claims-heading">Claim timing</h2>
            {result.claims.length > 0 ? (
              <dl className="jwt-claim-list">
                {result.claims.map((claim) => (
                  <div key={claim.label} className={`jwt-claim ${claim.tone}`}>
                    <dt>{claim.label}</dt>
                    <dd>{claim.message}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="jwt-detail-empty">
                {result.payloadJson ? 'No exp, nbf, or iat claims found.' : 'Decode a token.'}
              </p>
            )}
          </section>

          <section className="jwt-detail-panel" aria-labelledby="jwt-signature-heading">
            <h2 id="jwt-signature-heading">Signature</h2>
            <p className="jwt-signature-value">
              {result.signature ||
                (result.payloadJson ? 'No signature segment.' : 'Decode a token.')}
            </p>
            {result.payloadJson ? (
              <p className="jwt-warning">
                <ShieldAlert aria-hidden="true" />
                Signature is decoded but not verified.
              </p>
            ) : null}
          </section>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={runDecoder}>
            <ScanText aria-hidden="true" />
            Decode JWT
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void copy(decodedOutput)}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy decoded JSON
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear JWT
          </button>
        </div>

        {result.error ? (
          <p className="error-banner" role="alert">
            {result.error}
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

function getStatus(token: string, result: JwtDecodeResult, copied: boolean) {
  if (copied) {
    return {
      className: 'status-line success',
      message: 'Copied.',
    };
  }

  if (!token.trim() || !result.payloadJson) {
    return {
      className: 'status-line',
      message: '',
    };
  }

  return {
    className: 'status-line',
    message: 'JWT decoded locally. Signature has not been verified.',
  };
}
