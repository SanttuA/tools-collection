import { describe, expect, it } from 'vitest';

import {
  applyCalculatorInput,
  initialCalculatorState,
  mapKeyboardInput,
  type CalculatorInput,
} from './calculatorLogic';

function press(inputs: CalculatorInput[]) {
  return inputs.reduce(applyCalculatorInput, initialCalculatorState);
}

describe('calculator logic', () => {
  it('runs chained arithmetic without eval', () => {
    const state = press(['1', '2', '+', '7', '*', '2', '=']);

    expect(state.display).toBe('38');
  });

  it('handles decimals and floating point rounding', () => {
    const state = press(['0', '.', '1', '+', '0', '.', '2', '=']);

    expect(state.display).toBe('0.3');
  });

  it('handles divide by zero as an error state', () => {
    const state = press(['8', '/', '0', '=']);

    expect(state.display).toBe('Error');
    expect(state.error).toBe('Cannot divide by zero.');
  });

  it('supports keyboard mapping for common calculator keys', () => {
    expect(mapKeyboardInput('Enter')).toBe('=');
    expect(mapKeyboardInput('Backspace')).toBe('backspace');
    expect(mapKeyboardInput('x')).toBe('*');
    expect(mapKeyboardInput('A')).toBeNull();
  });
});
