export type ConversionCategoryId =
  | 'temperature'
  | 'length'
  | 'mass'
  | 'volume'
  | 'area'
  | 'speed'
  | 'time'
  | 'data'
  | 'energy'
  | 'power'
  | 'pressure'
  | 'angle';

type FactorUnitDefinition = {
  factorToBase: number;
  id: string;
  label: string;
  symbol: string;
};

type FormulaUnitDefinition = {
  fromBase: (value: number) => number;
  id: string;
  label: string;
  symbol: string;
  toBase: (value: number) => number;
};

export type ConversionUnitDefinition = FactorUnitDefinition | FormulaUnitDefinition;

export type ConversionCategory = {
  defaultFromUnitId: string;
  defaultToUnitId: string;
  description: string;
  id: ConversionCategoryId;
  label: string;
  units: readonly ConversionUnitDefinition[];
};

export type UnitConverterPreferences = {
  categoryId: ConversionCategoryId;
  fromUnitId: string;
  toUnitId: string;
};

export type ConversionResult = {
  error: string | null;
  numericValue: number | null;
  output: string;
};

export const unitConverterStorageKey = 'tools-collection.unit-converter.preferences';

const celsiusUnit: FormulaUnitDefinition = {
  id: 'celsius',
  label: 'Celsius',
  symbol: 'degC',
  toBase: (value) => value,
  fromBase: (value) => value,
};

export const conversionCategories = [
  {
    id: 'temperature',
    label: 'Temperature',
    description: 'Celsius, Fahrenheit, and Kelvin.',
    defaultFromUnitId: 'celsius',
    defaultToUnitId: 'fahrenheit',
    units: [
      celsiusUnit,
      {
        id: 'fahrenheit',
        label: 'Fahrenheit',
        symbol: 'degF',
        toBase: (value) => (value - 32) * (5 / 9),
        fromBase: (value) => value * (9 / 5) + 32,
      },
      {
        id: 'kelvin',
        label: 'Kelvin',
        symbol: 'K',
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15,
      },
    ],
  },
  {
    id: 'length',
    label: 'Length / Distance',
    description: 'Metric, imperial, and nautical distance units.',
    defaultFromUnitId: 'meter',
    defaultToUnitId: 'foot',
    units: [
      { id: 'millimeter', label: 'Millimeter', symbol: 'mm', factorToBase: 0.001 },
      { id: 'centimeter', label: 'Centimeter', symbol: 'cm', factorToBase: 0.01 },
      { id: 'meter', label: 'Meter', symbol: 'm', factorToBase: 1 },
      { id: 'kilometer', label: 'Kilometer', symbol: 'km', factorToBase: 1000 },
      { id: 'inch', label: 'Inch', symbol: 'in', factorToBase: 0.0254 },
      { id: 'foot', label: 'Foot', symbol: 'ft', factorToBase: 0.3048 },
      { id: 'yard', label: 'Yard', symbol: 'yd', factorToBase: 0.9144 },
      { id: 'mile', label: 'Mile', symbol: 'mi', factorToBase: 1609.344 },
      { id: 'nautical-mile', label: 'Nautical mile', symbol: 'nmi', factorToBase: 1852 },
    ],
  },
  {
    id: 'mass',
    label: 'Weight / Mass',
    description: 'Metric mass, avoirdupois weight, stone, and US tons.',
    defaultFromUnitId: 'kilogram',
    defaultToUnitId: 'pound',
    units: [
      { id: 'milligram', label: 'Milligram', symbol: 'mg', factorToBase: 0.000001 },
      { id: 'gram', label: 'Gram', symbol: 'g', factorToBase: 0.001 },
      { id: 'kilogram', label: 'Kilogram', symbol: 'kg', factorToBase: 1 },
      { id: 'metric-tonne', label: 'Metric tonne', symbol: 't', factorToBase: 1000 },
      { id: 'ounce', label: 'Ounce', symbol: 'oz', factorToBase: 0.028349523125 },
      { id: 'pound', label: 'Pound', symbol: 'lb', factorToBase: 0.45359237 },
      { id: 'stone', label: 'Stone', symbol: 'st', factorToBase: 6.35029318 },
      { id: 'us-short-ton', label: 'US short ton', symbol: 'ton', factorToBase: 907.18474 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    description: 'Metric volume and common US kitchen/liquid units.',
    defaultFromUnitId: 'liter',
    defaultToUnitId: 'us-gallon',
    units: [
      { id: 'milliliter', label: 'Milliliter', symbol: 'mL', factorToBase: 0.001 },
      { id: 'liter', label: 'Liter', symbol: 'L', factorToBase: 1 },
      { id: 'cubic-meter', label: 'Cubic meter', symbol: 'm3', factorToBase: 1000 },
      { id: 'us-teaspoon', label: 'US teaspoon', symbol: 'tsp', factorToBase: 0.00492892159375 },
      {
        id: 'us-tablespoon',
        label: 'US tablespoon',
        symbol: 'tbsp',
        factorToBase: 0.01478676478125,
      },
      {
        id: 'us-fluid-ounce',
        label: 'US fluid ounce',
        symbol: 'fl oz',
        factorToBase: 0.0295735295625,
      },
      { id: 'us-cup', label: 'US cup', symbol: 'cup', factorToBase: 0.2365882365 },
      { id: 'us-pint', label: 'US pint', symbol: 'pt', factorToBase: 0.473176473 },
      { id: 'us-quart', label: 'US quart', symbol: 'qt', factorToBase: 0.946352946 },
      { id: 'us-gallon', label: 'US gallon', symbol: 'gal', factorToBase: 3.785411784 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    description: 'Metric and imperial square units plus hectare and acre.',
    defaultFromUnitId: 'square-meter',
    defaultToUnitId: 'square-foot',
    units: [
      { id: 'square-centimeter', label: 'Square centimeter', symbol: 'cm2', factorToBase: 0.0001 },
      { id: 'square-meter', label: 'Square meter', symbol: 'm2', factorToBase: 1 },
      { id: 'square-kilometer', label: 'Square kilometer', symbol: 'km2', factorToBase: 1000000 },
      { id: 'hectare', label: 'Hectare', symbol: 'ha', factorToBase: 10000 },
      { id: 'square-inch', label: 'Square inch', symbol: 'in2', factorToBase: 0.00064516 },
      { id: 'square-foot', label: 'Square foot', symbol: 'ft2', factorToBase: 0.09290304 },
      { id: 'square-yard', label: 'Square yard', symbol: 'yd2', factorToBase: 0.83612736 },
      { id: 'acre', label: 'Acre', symbol: 'ac', factorToBase: 4046.8564224 },
      { id: 'square-mile', label: 'Square mile', symbol: 'mi2', factorToBase: 2589988.110336 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    description: 'Common road, scientific, and nautical speed units.',
    defaultFromUnitId: 'kilometer-per-hour',
    defaultToUnitId: 'mile-per-hour',
    units: [
      { id: 'meter-per-second', label: 'Meter per second', symbol: 'm/s', factorToBase: 1 },
      {
        id: 'kilometer-per-hour',
        label: 'Kilometer per hour',
        symbol: 'km/h',
        factorToBase: 1 / 3.6,
      },
      { id: 'mile-per-hour', label: 'Mile per hour', symbol: 'mph', factorToBase: 0.44704 },
      { id: 'foot-per-second', label: 'Foot per second', symbol: 'ft/s', factorToBase: 0.3048 },
      { id: 'knot', label: 'Knot', symbol: 'kn', factorToBase: 1852 / 3600 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    description: 'Durations from milliseconds through fixed 365-day years.',
    defaultFromUnitId: 'hour',
    defaultToUnitId: 'minute',
    units: [
      { id: 'millisecond', label: 'Millisecond', symbol: 'ms', factorToBase: 0.001 },
      { id: 'second', label: 'Second', symbol: 's', factorToBase: 1 },
      { id: 'minute', label: 'Minute', symbol: 'min', factorToBase: 60 },
      { id: 'hour', label: 'Hour', symbol: 'h', factorToBase: 3600 },
      { id: 'day', label: 'Day', symbol: 'd', factorToBase: 86400 },
      { id: 'week', label: 'Week', symbol: 'wk', factorToBase: 604800 },
      { id: 'year', label: 'Year', symbol: 'yr', factorToBase: 31536000 },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Bits, bytes, decimal units, and binary byte units.',
    defaultFromUnitId: 'megabyte',
    defaultToUnitId: 'mebibyte',
    units: [
      { id: 'bit', label: 'Bit', symbol: 'bit', factorToBase: 1 },
      { id: 'byte', label: 'Byte', symbol: 'B', factorToBase: 8 },
      { id: 'kilobit', label: 'Kilobit', symbol: 'kb', factorToBase: 1000 },
      { id: 'kilobyte', label: 'Kilobyte', symbol: 'kB', factorToBase: 8000 },
      { id: 'megabit', label: 'Megabit', symbol: 'Mb', factorToBase: 1000000 },
      { id: 'megabyte', label: 'Megabyte', symbol: 'MB', factorToBase: 8000000 },
      { id: 'gigabit', label: 'Gigabit', symbol: 'Gb', factorToBase: 1000000000 },
      { id: 'gigabyte', label: 'Gigabyte', symbol: 'GB', factorToBase: 8000000000 },
      { id: 'terabit', label: 'Terabit', symbol: 'Tb', factorToBase: 1000000000000 },
      { id: 'terabyte', label: 'Terabyte', symbol: 'TB', factorToBase: 8000000000000 },
      { id: 'kibibyte', label: 'Kibibyte', symbol: 'KiB', factorToBase: 8192 },
      { id: 'mebibyte', label: 'Mebibyte', symbol: 'MiB', factorToBase: 8388608 },
      { id: 'gibibyte', label: 'Gibibyte', symbol: 'GiB', factorToBase: 8589934592 },
      { id: 'tebibyte', label: 'Tebibyte', symbol: 'TiB', factorToBase: 8796093022208 },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    description: 'Joules, calories, watt-hours, kilowatt-hours, and BTU.',
    defaultFromUnitId: 'kilowatt-hour',
    defaultToUnitId: 'joule',
    units: [
      { id: 'joule', label: 'Joule', symbol: 'J', factorToBase: 1 },
      { id: 'kilojoule', label: 'Kilojoule', symbol: 'kJ', factorToBase: 1000 },
      { id: 'calorie', label: 'Calorie', symbol: 'cal', factorToBase: 4.184 },
      { id: 'kilocalorie', label: 'Kilocalorie', symbol: 'kcal', factorToBase: 4184 },
      { id: 'watt-hour', label: 'Watt-hour', symbol: 'Wh', factorToBase: 3600 },
      { id: 'kilowatt-hour', label: 'Kilowatt-hour', symbol: 'kWh', factorToBase: 3600000 },
      { id: 'btu', label: 'British thermal unit', symbol: 'BTU', factorToBase: 1055.05585262 },
    ],
  },
  {
    id: 'power',
    label: 'Power',
    description: 'Watts, kilowatts, mechanical horsepower, and BTU per hour.',
    defaultFromUnitId: 'watt',
    defaultToUnitId: 'horsepower',
    units: [
      { id: 'watt', label: 'Watt', symbol: 'W', factorToBase: 1 },
      { id: 'kilowatt', label: 'Kilowatt', symbol: 'kW', factorToBase: 1000 },
      {
        id: 'horsepower',
        label: 'Mechanical horsepower',
        symbol: 'hp',
        factorToBase: 745.6998715822702,
      },
      {
        id: 'btu-per-hour',
        label: 'BTU per hour',
        symbol: 'BTU/h',
        factorToBase: 1055.05585262 / 3600,
      },
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    description: 'Metric, atmospheric, tire, and vacuum pressure units.',
    defaultFromUnitId: 'kilopascal',
    defaultToUnitId: 'psi',
    units: [
      { id: 'pascal', label: 'Pascal', symbol: 'Pa', factorToBase: 1 },
      { id: 'kilopascal', label: 'Kilopascal', symbol: 'kPa', factorToBase: 1000 },
      { id: 'bar', label: 'Bar', symbol: 'bar', factorToBase: 100000 },
      { id: 'millibar', label: 'Millibar', symbol: 'mbar', factorToBase: 100 },
      { id: 'atmosphere', label: 'Atmosphere', symbol: 'atm', factorToBase: 101325 },
      { id: 'psi', label: 'Pound per square inch', symbol: 'psi', factorToBase: 6894.757293168361 },
      { id: 'torr', label: 'Torr / mmHg', symbol: 'torr', factorToBase: 133.32236842105263 },
    ],
  },
  {
    id: 'angle',
    label: 'Angle',
    description: 'Degrees, radians, gradians, turns, arcminutes, and arcseconds.',
    defaultFromUnitId: 'degree',
    defaultToUnitId: 'radian',
    units: [
      { id: 'degree', label: 'Degree', symbol: 'deg', factorToBase: Math.PI / 180 },
      { id: 'radian', label: 'Radian', symbol: 'rad', factorToBase: 1 },
      { id: 'gradian', label: 'Gradian', symbol: 'grad', factorToBase: Math.PI / 200 },
      { id: 'turn', label: 'Turn', symbol: 'turn', factorToBase: Math.PI * 2 },
      { id: 'arcminute', label: 'Arcminute', symbol: 'arcmin', factorToBase: Math.PI / 10800 },
      { id: 'arcsecond', label: 'Arcsecond', symbol: 'arcsec', factorToBase: Math.PI / 648000 },
    ],
  },
] as const satisfies readonly ConversionCategory[];

const categoryMap = new Map<ConversionCategoryId, ConversionCategory>(
  conversionCategories.map((category) => [category.id, category]),
);

const completeNumberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const incompleteNumberPattern = /^[+-]?(?:\.?|\d+\.?|\d+(?:\.\d*)?e[+-]?)$/i;

export function getCategoryById(id: string): ConversionCategory | undefined {
  return categoryMap.get(id as ConversionCategoryId);
}

export function getUnitById(
  category: ConversionCategory,
  unitId: string,
): ConversionUnitDefinition | undefined {
  return category.units.find((unit) => unit.id === unitId);
}

export function getDefaultPreferences(categoryId: ConversionCategoryId = 'temperature') {
  const category = categoryMap.get(categoryId) ?? conversionCategories[0];

  return {
    categoryId: category.id,
    fromUnitId: category.defaultFromUnitId,
    toUnitId: category.defaultToUnitId,
  };
}

export function normalizePreferences(
  preferences: Partial<UnitConverterPreferences> | null | undefined,
): UnitConverterPreferences {
  const category = getCategoryById(preferences?.categoryId ?? '') ?? conversionCategories[0];
  const defaults = getDefaultPreferences(category.id);
  const fromUnit = getUnitById(category, preferences?.fromUnitId ?? '');
  const toUnit = getUnitById(category, preferences?.toUnitId ?? '');

  return {
    categoryId: category.id,
    fromUnitId: fromUnit?.id ?? defaults.fromUnitId,
    toUnitId: toUnit?.id ?? defaults.toUnitId,
  };
}

export function convertValue(
  value: number,
  categoryId: ConversionCategoryId,
  fromUnitId: string,
  toUnitId: string,
): number {
  const category = getCategoryById(categoryId);

  if (!category) {
    throw new Error(`Unknown conversion category: ${categoryId}`);
  }

  const fromUnit = getUnitById(category, fromUnitId);
  const toUnit = getUnitById(category, toUnitId);

  if (!fromUnit || !toUnit) {
    throw new Error('Unknown conversion unit.');
  }

  const baseValue = toBaseValue(value, fromUnit);
  return fromBaseValue(baseValue, toUnit);
}

export function convertInput(
  input: string,
  categoryId: ConversionCategoryId,
  fromUnitId: string,
  toUnitId: string,
): ConversionResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      error: null,
      numericValue: null,
      output: '',
    };
  }

  if (!completeNumberPattern.test(trimmedInput)) {
    if (incompleteNumberPattern.test(trimmedInput)) {
      return {
        error: null,
        numericValue: null,
        output: '',
      };
    }

    return {
      error: 'Enter a finite number.',
      numericValue: null,
      output: '',
    };
  }

  const numericInput = Number(trimmedInput);

  if (!Number.isFinite(numericInput)) {
    return {
      error: 'Enter a finite number.',
      numericValue: null,
      output: '',
    };
  }

  const convertedValue = convertValue(numericInput, categoryId, fromUnitId, toUnitId);

  return {
    error: null,
    numericValue: convertedValue,
    output: formatConvertedNumber(convertedValue),
  };
}

export function formatConvertedNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (Object.is(value, -0) || value === 0) {
    return '0';
  }

  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1e12 || absoluteValue < 1e-9) {
    return trimNumericString(value.toExponential(8));
  }

  return trimNumericString(value.toPrecision(12));
}

export function readUnitConverterPreferences(storage = getBrowserStorage()) {
  if (!storage) {
    return getDefaultPreferences();
  }

  try {
    const rawPreferences = storage.getItem(unitConverterStorageKey);

    if (!rawPreferences) {
      return getDefaultPreferences();
    }

    return normalizePreferences(JSON.parse(rawPreferences) as Partial<UnitConverterPreferences>);
  } catch {
    return getDefaultPreferences();
  }
}

export function writeUnitConverterPreferences(
  preferences: UnitConverterPreferences,
  storage = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(unitConverterStorageKey, JSON.stringify(normalizePreferences(preferences)));
    return true;
  } catch {
    return false;
  }
}

function toBaseValue(value: number, unit: ConversionUnitDefinition): number {
  if ('toBase' in unit) {
    return unit.toBase(value);
  }

  return value * unit.factorToBase;
}

function fromBaseValue(value: number, unit: ConversionUnitDefinition): number {
  if ('fromBase' in unit) {
    return unit.fromBase(value);
  }

  return value / unit.factorToBase;
}

function trimNumericString(value: string): string {
  return value
    .replace(/(\.\d*?[1-9])0+(e|$)/, '$1$2')
    .replace(/\.0+(e|$)/, '$1')
    .replace('e+', 'e');
}

function getBrowserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
