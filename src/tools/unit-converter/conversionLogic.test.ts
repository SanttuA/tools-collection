import { describe, expect, it, vi } from 'vitest';

import {
  convertInput,
  convertValue,
  formatConvertedNumber,
  getDefaultPreferences,
  normalizePreferences,
  readUnitConverterPreferences,
  unitConverterStorageKey,
  writeUnitConverterPreferences,
  type ConversionCategoryId,
} from './conversionLogic';

function createMemoryStorage(initialValue?: string) {
  const values: Record<string, string> = {};

  if (initialValue) {
    values[unitConverterStorageKey] = initialValue;
  }

  return {
    getItem: vi.fn<Storage['getItem']>((key) => values[key] ?? null),
    setItem: vi.fn<Storage['setItem']>((key, value) => {
      values[key] = value;
    }),
  } as unknown as Storage;
}

function withThrowingLocalStorage(callback: () => void) {
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage is unavailable');
    },
  });

  try {
    callback();
  } finally {
    if (localStorageDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', localStorageDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage');
    }
  }
}

describe('conversionLogic', () => {
  it.each<
    [
      categoryId: ConversionCategoryId,
      value: number,
      fromUnitId: string,
      toUnitId: string,
      expected: number,
    ]
  >([
    ['temperature', 100, 'celsius', 'fahrenheit', 212],
    ['length', 1, 'meter', 'foot', 3.280839895013123],
    ['mass', 1, 'kilogram', 'pound', 2.2046226218487757],
    ['volume', 1, 'us-gallon', 'liter', 3.785411784],
    ['area', 1, 'acre', 'square-meter', 4046.8564224],
    ['speed', 60, 'mile-per-hour', 'kilometer-per-hour', 96.56064],
    ['time', 2, 'day', 'hour', 48],
    ['data', 1, 'megabyte', 'mebibyte', 0.95367431640625],
    ['energy', 1, 'kilowatt-hour', 'joule', 3600000],
    ['power', 1, 'horsepower', 'watt', 745.6998715822702],
    ['pressure', 1, 'atmosphere', 'psi', 14.69594877551345],
    ['angle', 180, 'degree', 'radian', Math.PI],
  ])('converts %s values', (categoryId, value, fromUnitId, toUnitId, expected) => {
    expect(convertValue(value, categoryId, fromUnitId, toUnitId)).toBeCloseTo(expected, 10);
  });

  it('converts finite text input and formats the output', () => {
    expect(convertInput('100', 'temperature', 'celsius', 'fahrenheit')).toEqual({
      error: null,
      numericValue: 212,
      output: '212',
    });
  });

  it.each(['', '-', '+', '.', '1e', '1e-', '-1e+'])(
    'treats incomplete input "%s" as empty',
    (input) => {
      expect(convertInput(input, 'length', 'meter', 'foot')).toEqual({
        error: null,
        numericValue: null,
        output: '',
      });
    },
  );

  it.each(['abc', '0x10', '1,000', 'Infinity'])('rejects invalid input "%s"', (input) => {
    const result = convertInput(input, 'length', 'meter', 'foot');

    expect(result.error).toBe('Enter a finite number.');
    expect(result.output).toBe('');
    expect(result.numericValue).toBeNull();
  });

  it('formats recurring and extreme values compactly', () => {
    expect(formatConvertedNumber(1 / 3)).toBe('0.333333333333');
    expect(formatConvertedNumber(1000000000000)).toBe('1e12');
    expect(formatConvertedNumber(0.000000000123)).toBe('1.23e-10');
  });

  it('normalizes invalid stored preferences to safe defaults', () => {
    expect(
      normalizePreferences({
        categoryId: 'length',
        fromUnitId: 'nope',
        toUnitId: 'mile',
      }),
    ).toEqual({
      categoryId: 'length',
      fromUnitId: 'meter',
      toUnitId: 'mile',
    });

    expect(normalizePreferences({ categoryId: 'unknown' as ConversionCategoryId })).toEqual(
      getDefaultPreferences(),
    );
  });

  it('reads and writes normalized preferences', () => {
    const storage = createMemoryStorage();
    const preferences = {
      categoryId: 'length' as const,
      fromUnitId: 'kilometer',
      toUnitId: 'mile',
    };

    expect(writeUnitConverterPreferences(preferences, storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      unitConverterStorageKey,
      JSON.stringify(preferences),
    );
    expect(readUnitConverterPreferences(storage)).toEqual(preferences);
  });

  it('falls back to defaults when local storage is unavailable', () => {
    withThrowingLocalStorage(() => {
      expect(readUnitConverterPreferences()).toEqual(getDefaultPreferences());
      expect(writeUnitConverterPreferences(getDefaultPreferences())).toBe(false);
    });
  });
});
