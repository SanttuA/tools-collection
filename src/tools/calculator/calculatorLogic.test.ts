import { describe, expect, it } from 'vitest';

import {
  applyCalculatorInput,
  getCalculatorStatusLine,
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

  it('shows a live pending expression while typing', () => {
    const state = press(['1', '2', '+', '2', '3']);

    expect(getCalculatorStatusLine(state)).toBe('12 + 23');
  });

  it('keeps the completed expression after equals', () => {
    const state = press(['1', '2', '+', '2', '3', '=']);

    expect(state.display).toBe('35');
    expect(getCalculatorStatusLine(state)).toBe('12 + 23 =');
  });

  it('updates the operation line when replacing an operator', () => {
    const state = press(['1', '2', '+', '-']);

    expect(getCalculatorStatusLine(state)).toBe('12 -');
  });

  it('clears the operation line when reset', () => {
    const state = applyCalculatorInput(press(['1', '2', '+', '2', '3', '=']), 'clear');

    expect(state.display).toBe('0');
    expect(getCalculatorStatusLine(state)).toBe('');
  });

  it('shows the collapsed result for chained operations', () => {
    const state = press(['1', '2', '+', '7', '*']);

    expect(state.display).toBe('19');
    expect(getCalculatorStatusLine(state)).toBe('19 x');
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
