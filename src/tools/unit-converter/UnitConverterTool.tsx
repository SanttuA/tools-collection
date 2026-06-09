import { ArrowLeftRight, Check, Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCopyToClipboard } from '@/shared/useCopyToClipboard';
import type { ToolComponentProps } from '@/tools/types';

import {
  conversionCategories,
  convertInput,
  getCategoryById,
  getDefaultPreferences,
  getUnitById,
  readUnitConverterPreferences,
  writeUnitConverterPreferences,
  type ConversionCategoryId,
  type UnitConverterPreferences,
} from './conversionLogic';

function formatUnitOptionLabel(label: string, symbol: string) {
  return `${label} (${symbol})`;
}

export function UnitConverterTool({ headingId }: ToolComponentProps) {
  const [preferences, setPreferences] = useState<UnitConverterPreferences>(() =>
    readUnitConverterPreferences(),
  );
  const [inputValue, setInputValue] = useState('');
  const { copied, copy } = useCopyToClipboard();

  const category = getCategoryById(preferences.categoryId) ?? conversionCategories[0];
  const fromUnit = getUnitById(category, preferences.fromUnitId) ?? category.units[0];
  const toUnit =
    getUnitById(category, preferences.toUnitId) ?? category.units[1] ?? category.units[0];
  const conversion = useMemo(
    () => convertInput(inputValue, category.id, fromUnit.id, toUnit.id),
    [category.id, fromUnit.id, inputValue, toUnit.id],
  );

  const persistPreferences = (nextPreferences: UnitConverterPreferences) => {
    setPreferences(nextPreferences);
    writeUnitConverterPreferences(nextPreferences);
  };

  const changeCategory = (categoryId: ConversionCategoryId) => {
    persistPreferences(getDefaultPreferences(categoryId));
  };

  const changeFromUnit = (fromUnitId: string) => {
    persistPreferences({
      ...preferences,
      fromUnitId,
    });
  };

  const changeToUnit = (toUnitId: string) => {
    persistPreferences({
      ...preferences,
      toUnitId,
    });
  };

  const swapUnits = () => {
    persistPreferences({
      ...preferences,
      fromUnitId: preferences.toUnitId,
      toUnitId: preferences.fromUnitId,
    });
  };

  const clear = () => {
    setInputValue('');
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Conversion</p>
          <h1 id={headingId}>Unit Converter</h1>
          <p>Convert common units for temperature, distance, mass, volume, and more.</p>
        </div>
      </header>

      <div className="tool-panel converter-panel">
        <label className="field-block converter-category-field">
          <span className="field-label">Conversion category</span>
          <select
            aria-label="Conversion category"
            className="text-input"
            onChange={(event) => changeCategory(event.target.value as ConversionCategoryId)}
            value={category.id}
          >
            {conversionCategories.map((conversionCategory) => (
              <option key={conversionCategory.id} value={conversionCategory.id}>
                {conversionCategory.label}
              </option>
            ))}
          </select>
          <span className="converter-hint">{category.description}</span>
        </label>

        <div className="converter-grid">
          <label className="field-block">
            <span className="field-label">Value</span>
            <input
              aria-describedby="unit-converter-input-hint"
              aria-label="Value to convert"
              className="text-input converter-value-input"
              inputMode="decimal"
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Enter a number"
              type="text"
              value={inputValue}
            />
            <span id="unit-converter-input-hint" className="converter-hint">
              Decimals and scientific notation are supported.
            </span>
          </label>

          <label className="field-block">
            <span className="field-label">From unit</span>
            <select
              aria-label="From unit"
              className="text-input"
              onChange={(event) => changeFromUnit(event.target.value)}
              value={fromUnit.id}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {formatUnitOptionLabel(unit.label, unit.symbol)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-block">
            <span className="field-label">To unit</span>
            <select
              aria-label="To unit"
              className="text-input"
              onChange={(event) => changeToUnit(event.target.value)}
              value={toUnit.id}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {formatUnitOptionLabel(unit.label, unit.symbol)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="converter-output-card" aria-live="polite">
          <span className="converter-output-label">Converted value</span>
          <output className="converter-output-value" aria-label="Converted value">
            {conversion.output || ' '}
          </output>
          <span className="converter-output-unit">{toUnit.symbol}</span>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={swapUnits}>
            <ArrowLeftRight aria-hidden="true" />
            Swap units
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!conversion.output}
            onClick={() => void copy(conversion.output)}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            Copy result
          </button>
          <button type="button" className="danger-button" onClick={clear}>
            <Trash2 aria-hidden="true" />
            Clear value
          </button>
        </div>

        {conversion.error ? (
          <p className="error-banner" role="alert">
            {conversion.error}
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
