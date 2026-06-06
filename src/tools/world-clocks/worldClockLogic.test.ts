import { describe, expect, it, vi } from 'vitest';

import {
  fallbackTimeZones,
  formatGmtOffset,
  getCanonicalTimeZone,
  getReadableTimeZoneLabel,
  getSupportedTimeZones,
  getTimeZoneOffsetMinutes,
  isValidTimeZone,
  normalizeCustomTimeZones,
  readStoredTimeZones,
  searchTimeZones,
  writeStoredTimeZones,
  worldClocksStorageKey,
} from './worldClockLogic';

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

describe('worldClockLogic', () => {
  it('validates IANA time zone IDs', () => {
    expect(isValidTimeZone('Europe/Helsinki')).toBe(true);
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
  });

  it('canonicalizes accepted aliases and casing variants', () => {
    expect(getCanonicalTimeZone('europe/helsinki')).toBe('Europe/Helsinki');
    expect(getCanonicalTimeZone('GMT')).toBe('UTC');
    expect(getCanonicalTimeZone('Etc/GMT')).toBe('UTC');
    expect(getCanonicalTimeZone('US/Eastern')).toBe('America/New_York');
    expect(getCanonicalTimeZone('US/Pacific')).toBe('America/Los_Angeles');
    expect(getCanonicalTimeZone('PST8PDT')).toBe('America/Los_Angeles');
  });

  it('dedupes canonical custom zones and excludes default clocks', () => {
    expect(
      normalizeCustomTimeZones([
        'australia/sydney',
        'Europe/Helsinki',
        'Australia/Sydney',
        'US/Eastern',
        'Not/AZone',
      ]),
    ).toEqual(['Australia/Sydney']);
  });

  it('reads stored aliases as canonical custom zones', () => {
    const storage = {
      getItem: vi.fn<Storage['getItem']>(() =>
        JSON.stringify(['australia/sydney', 'GMT', 'US/Eastern']),
      ),
    } as unknown as Storage;

    expect(readStoredTimeZones(storage)).toEqual(['Australia/Sydney']);
    expect(storage.getItem).toHaveBeenCalledWith(worldClocksStorageKey);
  });

  it('writes canonical custom zones to storage', () => {
    const storage = {
      setItem: vi.fn<Storage['setItem']>(),
    } as unknown as Storage;

    expect(writeStoredTimeZones(['australia/sydney', 'GMT'], storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      worldClocksStorageKey,
      JSON.stringify(['Australia/Sydney']),
    );
  });

  it('returns empty stored zones when browser storage access throws', () => {
    withThrowingLocalStorage(() => {
      expect(readStoredTimeZones()).toEqual([]);
    });
  });

  it('reports failed writes when browser storage access throws', () => {
    withThrowingLocalStorage(() => {
      expect(writeStoredTimeZones(['Australia/Sydney'])).toBe(false);
    });
  });

  it('uses the fallback time zone list when browser-supported values are unavailable', () => {
    const supported = getSupportedTimeZones({});

    expect(supported).toContain('UTC');
    expect(supported).toContain('Europe/Helsinki');
    expect(supported).toContain('Australia/Sydney');
    expect(supported.length).toBeGreaterThanOrEqual(fallbackTimeZones.length);
  });

  it('uses browser-supported zones when available and keeps UTC available', () => {
    expect(
      getSupportedTimeZones({
        supportedValuesOf: () => ['Europe/Helsinki', 'Asia/Tokyo'],
      }),
    ).toEqual(['UTC', 'Europe/Helsinki', 'Asia/Tokyo']);
  });

  it('formats readable labels from IANA IDs', () => {
    expect(getReadableTimeZoneLabel('America/New_York')).toBe('New York, America');
    expect(getReadableTimeZoneLabel('UTC')).toBe('UTC');
  });

  it('searches by city and time zone ID while excluding displayed zones', () => {
    expect(
      searchTimeZones('sydney', ['Europe/Helsinki'], ['Australia/Sydney', 'Europe/Helsinki']),
    ).toEqual([{ label: 'Sydney, Australia', timeZone: 'Australia/Sydney' }]);
  });

  it('calculates DST-aware offsets for Finland and New York', () => {
    const winter = new Date('2026-01-15T12:00:00Z');
    const summer = new Date('2026-07-15T12:00:00Z');

    expect(getTimeZoneOffsetMinutes(winter, 'Europe/Helsinki')).toBe(120);
    expect(getTimeZoneOffsetMinutes(summer, 'Europe/Helsinki')).toBe(180);
    expect(getTimeZoneOffsetMinutes(winter, 'America/New_York')).toBe(-300);
    expect(getTimeZoneOffsetMinutes(summer, 'America/New_York')).toBe(-240);
  });

  it('formats GMT offsets compactly', () => {
    expect(formatGmtOffset(0)).toBe('GMT');
    expect(formatGmtOffset(180)).toBe('GMT+3');
    expect(formatGmtOffset(-330)).toBe('GMT-5:30');
  });
});
