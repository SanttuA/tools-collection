import { Delete, Divide, Equal, Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { ToolComponentProps } from '@/tools/types';

import {
  applyCalculatorInput,
  initialCalculatorState,
  mapKeyboardInput,
  type CalculatorInput,
} from './calculatorLogic';

type CalculatorButton = {
  input: CalculatorInput;
  label: string;
  ariaLabel: string;
  variant?: 'command' | 'operator' | 'equals';
  wide?: boolean;
};

const buttons: CalculatorButton[] = [
  { input: 'clear', label: 'AC', ariaLabel: 'Clear calculator', variant: 'command' },
  { input: 'backspace', label: 'Del', ariaLabel: 'Backspace', variant: 'command' },
  { input: 'percent', label: '%', ariaLabel: 'Percent', variant: 'command' },
  { input: '/', label: '/', ariaLabel: 'Divide', variant: 'operator' },
  { input: '7', label: '7', ariaLabel: '7' },
  { input: '8', label: '8', ariaLabel: '8' },
  { input: '9', label: '9', ariaLabel: '9' },
  { input: '*', label: 'x', ariaLabel: 'Multiply', variant: 'operator' },
  { input: '4', label: '4', ariaLabel: '4' },
  { input: '5', label: '5', ariaLabel: '5' },
  { input: '6', label: '6', ariaLabel: '6' },
  { input: '-', label: '-', ariaLabel: 'Subtract', variant: 'operator' },
  { input: '1', label: '1', ariaLabel: '1' },
  { input: '2', label: '2', ariaLabel: '2' },
  { input: '3', label: '3', ariaLabel: '3' },
  { input: '+', label: '+', ariaLabel: 'Add', variant: 'operator' },
  { input: '0', label: '0', ariaLabel: '0', wide: true },
  { input: '.', label: '.', ariaLabel: 'Decimal point' },
  { input: '=', label: '=', ariaLabel: 'Equals', variant: 'equals', wide: true },
];

const buttonIcons: Partial<Record<CalculatorInput, ReactNode>> = {
  clear: <RotateCcw aria-hidden="true" />,
  backspace: <Delete aria-hidden="true" />,
  '/': <Divide aria-hidden="true" />,
  '*': <X aria-hidden="true" />,
  '-': <Minus aria-hidden="true" />,
  '+': <Plus aria-hidden="true" />,
  '=': <Equal aria-hidden="true" />,
};

export function CalculatorTool({ headingId }: ToolComponentProps) {
  const [state, setState] = useState(initialCalculatorState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const input = mapKeyboardInput(event.key);

      if (!input) {
        return;
      }

      event.preventDefault();
      setState((current) => applyCalculatorInput(current, input));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dispatch = (input: CalculatorInput) => {
    setState((current) => applyCalculatorInput(current, input));
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Math</p>
          <h1 id={headingId}>Calculator</h1>
          <p>Standard arithmetic with decimal, percent, sign, and keyboard input.</p>
        </div>
      </header>

      <div className="tool-panel compact calculator-panel">
        <output className="calculator-display" aria-label="Calculator display">
          {state.display}
        </output>
        <div className="calculator-grid">
          {buttons.map((button) => (
            <button
              key={`${button.input}-${button.ariaLabel}`}
              type="button"
              aria-label={button.ariaLabel}
              className={[
                'calculator-button',
                button.variant ?? '',
                button.input === '0' ? 'zero' : '',
              ].join(' ')}
              onClick={() => dispatch(button.input)}
            >
              {buttonIcons[button.input] ?? button.label}
            </button>
          ))}
        </div>
        {state.error ? (
          <p className="error-banner" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
