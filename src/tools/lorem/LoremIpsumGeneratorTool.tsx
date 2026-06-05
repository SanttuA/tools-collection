import { Check, Copy, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import {
  clampLoremCount,
  defaultLoremOptions,
  generateLoremIpsum,
  getLoremStats,
  loremCountBounds,
  type LoremMode,
} from './loremLogic';

const modes: { label: string; value: LoremMode }[] = [
  { label: 'Paragraphs', value: 'paragraphs' },
  { label: 'Sentences', value: 'sentences' },
  { label: 'Words', value: 'words' },
];

export function LoremIpsumGeneratorTool({ headingId }: ToolComponentProps) {
  const [mode, setMode] = useState<LoremMode>(defaultLoremOptions.mode);
  const [countValue, setCountValue] = useState(String(defaultLoremOptions.count));
  const [startsWithLorem, setStartsWithLorem] = useState(defaultLoremOptions.startsWithLorem);
  const [seed, setSeed] = useState(defaultLoremOptions.seed);
  const [isCleared, setIsCleared] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const count = clampLoremCount(mode, Number(countValue));
  const bounds = loremCountBounds[mode];
  const output = useMemo(() => {
    if (isCleared) {
      return '';
    }

    return generateLoremIpsum({
      count,
      mode,
      seed,
      startsWithLorem,
    });
  }, [count, isCleared, mode, seed, startsWithLorem]);
  const stats = useMemo(() => getLoremStats(output), [output]);

  const updateMode = (nextMode: LoremMode) => {
    const nextCount = clampLoremCount(nextMode, Number(countValue));
    setMode(nextMode);
    setCountValue(String(nextCount));
    setIsCleared(false);
  };

  const updateCount = (value: string) => {
    setCountValue(value);
    setIsCleared(false);
  };

  const normalizeCount = () => {
    setCountValue(String(count));
  };

  const toggleLoremStart = (checked: boolean) => {
    setStartsWithLorem(checked);
    setIsCleared(false);
  };

  const regenerate = () => {
    setSeed((currentSeed) => currentSeed + 1);
    setIsCleared(false);
  };

  const clear = () => {
    setIsCleared(true);
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Text</p>
          <h1 id={headingId}>Lorem Ipsum Generator</h1>
          <p>Generate placeholder text with local controls for paragraphs, sentences, or words.</p>
        </div>
      </header>

      <div className="tool-panel">
        <div className="lorem-control-grid">
          <fieldset className="field-block lorem-fieldset">
            <legend className="field-label">Generation mode</legend>
            <div className="lorem-segmented-control">
              {modes.map((option) => (
                <label key={option.value} className="lorem-segmented-option">
                  <input
                    aria-label={option.label}
                    checked={mode === option.value}
                    name="lorem-mode"
                    onChange={() => updateMode(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field-block">
            <span className="field-label">Count</span>
            <input
              aria-describedby="lorem-count-hint"
              aria-label="Count"
              className="text-input"
              inputMode="numeric"
              max={bounds.max}
              min={bounds.min}
              onBlur={normalizeCount}
              onChange={(event) => updateCount(event.target.value)}
              type="number"
              value={countValue}
            />
            <span id="lorem-count-hint" className="lorem-hint">
              {bounds.min}-{bounds.max} {mode}.
            </span>
          </label>

          <label className="lorem-toggle">
            <input
              aria-label="Start with Lorem ipsum"
              checked={startsWithLorem}
              onChange={(event) => toggleLoremStart(event.target.checked)}
              type="checkbox"
            />
            <span>Start with Lorem ipsum</span>
          </label>
        </div>

        <label className="field-block lorem-output-block">
          <span className="field-label">Generated text</span>
          <textarea
            className="text-area text-output"
            aria-label="Generated text"
            readOnly
            spellCheck={false}
            value={output}
          />
        </label>

        <div className="lorem-stats" aria-label="Generated text stats">
          <span>{stats.paragraphs} paragraphs</span>
          <span>{stats.sentences} sentences</span>
          <span>{stats.words} words</span>
          <span>{stats.characters} characters</span>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={regenerate}>
            <RotateCcw aria-hidden="true" />
            Regenerate text
          </button>
          <button type="button" className="secondary-button" onClick={() => void copy(output)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy generated text
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear text
          </button>
        </div>

        <p className={copied ? 'status-line success' : 'status-line'} aria-live="polite">
          {copied ? 'Copied.' : ''}
        </p>
      </div>
    </div>
  );
}
