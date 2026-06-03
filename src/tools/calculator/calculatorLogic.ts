export type CalculatorOperator = '+' | '-' | '*' | '/';

export type CalculatorInput =
  | 'clear'
  | 'backspace'
  | 'negate'
  | 'percent'
  | '='
  | '.'
  | CalculatorOperator
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export type CalculatorState = {
  display: string;
  storedValue: number | null;
  pendingOperator: CalculatorOperator | null;
  awaitingOperand: boolean;
  error: string | null;
};

type CalculationResult = { type: 'success'; value: number } | { type: 'error'; error: string };

export const initialCalculatorState: CalculatorState = {
  display: '0',
  storedValue: null,
  pendingOperator: null,
  awaitingOperand: false,
  error: null,
};

const maxDisplayLength = 16;

export function applyCalculatorInput(
  state: CalculatorState,
  input: CalculatorInput,
): CalculatorState {
  if (input === 'clear') {
    return initialCalculatorState;
  }

  if (state.error) {
    return applyCalculatorInput(initialCalculatorState, input);
  }

  if (isDigit(input)) {
    return inputDigit(state, input);
  }

  if (isOperator(input)) {
    return chooseOperator(state, input);
  }

  switch (input) {
    case '.':
      return inputDecimal(state);
    case 'backspace':
      return backspace(state);
    case 'negate':
      return negate(state);
    case 'percent':
      return percent(state);
    case '=':
      return calculate(state);
    default:
      return state;
  }
}

export function mapKeyboardInput(key: string): CalculatorInput | null {
  if (/^\d$/.test(key)) {
    return key as CalculatorInput;
  }

  const inputMap: Record<string, CalculatorInput> = {
    '.': '.',
    '+': '+',
    '-': '-',
    '*': '*',
    x: '*',
    X: '*',
    '/': '/',
    Enter: '=',
    '=': '=',
    Backspace: 'backspace',
    Escape: 'clear',
    Delete: 'clear',
    '%': 'percent',
  };

  return inputMap[key] ?? null;
}

function inputDigit(state: CalculatorState, digit: CalculatorInput): CalculatorState {
  if (!isDigit(digit)) {
    return state;
  }

  if (state.awaitingOperand) {
    return {
      ...state,
      display: digit,
      awaitingOperand: false,
    };
  }

  if (state.display === '0') {
    return {
      ...state,
      display: digit,
    };
  }

  if (state.display.replace('-', '').length >= maxDisplayLength) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}${digit}`,
  };
}

function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.awaitingOperand) {
    return {
      ...state,
      display: '0.',
      awaitingOperand: false,
    };
  }

  if (state.display.includes('.')) {
    return state;
  }

  return {
    ...state,
    display: `${state.display}.`,
  };
}

function backspace(state: CalculatorState): CalculatorState {
  if (state.awaitingOperand) {
    return state;
  }

  if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
    return {
      ...state,
      display: '0',
    };
  }

  return {
    ...state,
    display: state.display.slice(0, -1),
  };
}

function negate(state: CalculatorState): CalculatorState {
  if (state.display === '0') {
    return state;
  }

  return {
    ...state,
    display: state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`,
  };
}

function percent(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: formatNumber(parseDisplay(state.display) / 100),
  };
}

function chooseOperator(state: CalculatorState, operator: CalculatorOperator): CalculatorState {
  const inputValue = parseDisplay(state.display);

  if (state.pendingOperator && state.storedValue !== null && !state.awaitingOperand) {
    const result = performCalculation(state.storedValue, inputValue, state.pendingOperator);

    if (result.type === 'error') {
      return {
        ...initialCalculatorState,
        display: 'Error',
        error: result.error,
      };
    }

    return {
      display: formatNumber(result.value),
      storedValue: result.value,
      pendingOperator: operator,
      awaitingOperand: true,
      error: null,
    };
  }

  return {
    ...state,
    storedValue: inputValue,
    pendingOperator: operator,
    awaitingOperand: true,
  };
}

function calculate(state: CalculatorState): CalculatorState {
  if (!state.pendingOperator || state.storedValue === null) {
    return state;
  }

  const secondValue = parseDisplay(state.display);
  const result = performCalculation(state.storedValue, secondValue, state.pendingOperator);

  if (result.type === 'error') {
    return {
      ...initialCalculatorState,
      display: 'Error',
      error: result.error,
    };
  }

  return {
    display: formatNumber(result.value),
    storedValue: null,
    pendingOperator: null,
    awaitingOperand: true,
    error: null,
  };
}

function performCalculation(
  firstValue: number,
  secondValue: number,
  operator: CalculatorOperator,
): CalculationResult {
  switch (operator) {
    case '+':
      return { type: 'success', value: firstValue + secondValue };
    case '-':
      return { type: 'success', value: firstValue - secondValue };
    case '*':
      return { type: 'success', value: firstValue * secondValue };
    case '/':
      if (secondValue === 0) {
        return { type: 'error', error: 'Cannot divide by zero.' };
      }

      return { type: 'success', value: firstValue / secondValue };
    default:
      return { type: 'success', value: secondValue };
  }
}

function parseDisplay(display: string): number {
  return Number.parseFloat(display);
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number.parseFloat(value.toPrecision(12));

  if (Object.is(rounded, -0)) {
    return '0';
  }

  return rounded.toString();
}

function isDigit(input: CalculatorInput): input is Extract<CalculatorInput, `${number}`> {
  return /^\d$/.test(input);
}

function isOperator(input: CalculatorInput): input is CalculatorOperator {
  return input === '+' || input === '-' || input === '*' || input === '/';
}
