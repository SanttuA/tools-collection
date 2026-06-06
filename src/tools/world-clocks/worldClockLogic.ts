export type WorldClockDefinition = {
  label: string;
  timeZone: string;
};

export type ClockDisplay = {
  dateLabel: string;
  gmtOffset: string;
  isoDateTime: string;
  timeLabel: string;
  timeZoneName: string;
};

export const worldClocksStorageKey = 'tools-collection-world-clocks';

export const defaultWorldClocks = [
  { label: 'Finland', timeZone: 'Europe/Helsinki' },
  { label: 'Western Europe', timeZone: 'Europe/Lisbon' },
  { label: 'Central Europe', timeZone: 'Europe/Berlin' },
  { label: 'Eastern Europe', timeZone: 'Europe/Athens' },
  { label: 'GMT / UTC', timeZone: 'UTC' },
  { label: 'US Eastern', timeZone: 'America/New_York' },
  { label: 'US Central', timeZone: 'America/Chicago' },
  { label: 'US Mountain', timeZone: 'America/Denver' },
  { label: 'US Pacific', timeZone: 'America/Los_Angeles' },
  { label: 'US Alaska', timeZone: 'America/Anchorage' },
  { label: 'US Hawaii', timeZone: 'Pacific/Honolulu' },
  { label: 'Japan', timeZone: 'Asia/Tokyo' },
] satisfies WorldClockDefinition[];

export const fallbackTimeZones = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Brussels',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];

type TimeZoneSupportSource = {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

const defaultTimeZoneSet = new Set(defaultWorldClocks.map((clock) => clock.timeZone));

function uniqueTimeZones(timeZones: string[]): string[] {
  return Array.from(new Set(timeZones));
}

export function isValidTimeZone(timeZone: string): boolean {
  return getCanonicalTimeZone(timeZone) !== undefined;
}

export function getCanonicalTimeZone(timeZone: string): string | undefined {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone }).resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function normalizeCustomTimeZones(timeZones: unknown): string[] {
  if (!Array.isArray(timeZones)) {
    return [];
  }

  return uniqueTimeZones(
    timeZones.flatMap((timeZone) => {
      if (typeof timeZone !== 'string') {
        return [];
      }

      const canonicalTimeZone = getCanonicalTimeZone(timeZone);

      return canonicalTimeZone && !defaultTimeZoneSet.has(canonicalTimeZone)
        ? [canonicalTimeZone]
        : [];
    }),
  );
}

export function readStoredTimeZones(storage?: Storage): string[] {
  try {
    const resolvedStorage = storage ?? globalThis.localStorage;

    if (!resolvedStorage) {
      return [];
    }

    return normalizeCustomTimeZones(
      JSON.parse(resolvedStorage.getItem(worldClocksStorageKey) ?? '[]'),
    );
  } catch {
    return [];
  }
}

export function writeStoredTimeZones(timeZones: string[], storage?: Storage): boolean {
  try {
    const resolvedStorage = storage ?? globalThis.localStorage;

    if (!resolvedStorage) {
      return false;
    }

    resolvedStorage.setItem(
      worldClocksStorageKey,
      JSON.stringify(normalizeCustomTimeZones(timeZones)),
    );
    return true;
  } catch {
    return false;
  }
}

export function getSupportedTimeZones(source: TimeZoneSupportSource = Intl): string[] {
  const supportedTimeZones =
    typeof source.supportedValuesOf === 'function'
      ? source.supportedValuesOf('timeZone')
      : fallbackTimeZones;

  return uniqueTimeZones(
    ['UTC', ...supportedTimeZones]
      .map(getCanonicalTimeZone)
      .filter((timeZone): timeZone is string => timeZone !== undefined),
  );
}

export function getReadableTimeZoneLabel(timeZone: string): string {
  if (timeZone === 'UTC') {
    return 'UTC';
  }

  const parts = timeZone.split('/');
  const area = parts[0]?.replace(/_/g, ' ') ?? timeZone;
  const place = parts.at(-1)?.replace(/_/g, ' ') ?? timeZone;

  if (parts.length < 2) {
    return timeZone.replace(/_/g, ' ');
  }

  return `${place}, ${area}`;
}

export function searchTimeZones(
  query: string,
  excludedTimeZones: string[],
  supportedTimeZones = getSupportedTimeZones(),
): WorldClockDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const excluded = new Set(
    excludedTimeZones
      .map(getCanonicalTimeZone)
      .filter((timeZone): timeZone is string => timeZone !== undefined),
  );

  return uniqueTimeZones(
    supportedTimeZones.flatMap((timeZone) => {
      const canonicalTimeZone = getCanonicalTimeZone(timeZone);

      return canonicalTimeZone ? [canonicalTimeZone] : [];
    }),
  )
    .filter((timeZone) => !excluded.has(timeZone))
    .map((timeZone) => ({ label: getReadableTimeZoneLabel(timeZone), timeZone }))
    .filter((clock) => `${clock.label} ${clock.timeZone}`.toLowerCase().includes(normalizedQuery))
    .slice(0, 8);
}

function getTimeZoneDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);
  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(partMap.get('day')),
    hour: Number(partMap.get('hour')),
    minute: Number(partMap.get('minute')),
    month: Number(partMap.get('month')),
    second: Number(partMap.get('second')),
    year: Number(partMap.get('year')),
  };
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getTimeZoneDateParts(date, timeZone);
  const utcLikeTime = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return Math.round((utcLikeTime - date.getTime()) / 60_000);
}

export function formatGmtOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) {
    return 'GMT';
  }

  const sign = offsetMinutes > 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return minutes === 0
    ? `GMT${sign}${hours}`
    : `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

export function getTimeZoneName(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date);

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}

export function formatClockDisplay(date: Date, timeZone: string): ClockDisplay {
  return {
    dateLabel: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      timeZone,
      weekday: 'short',
      year: 'numeric',
    }).format(date),
    gmtOffset: formatGmtOffset(getTimeZoneOffsetMinutes(date, timeZone)),
    isoDateTime: date.toISOString(),
    timeLabel: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      second: '2-digit',
      timeZone,
    }).format(date),
    timeZoneName: getTimeZoneName(date, timeZone),
  };
}
