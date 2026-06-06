import { describe, expect, it } from 'vitest';

import {
  fallbackTimeZones,
  formatGmtOffset,
  getReadableTimeZoneLabel,
  getSupportedTimeZones,
  getTimeZoneOffsetMinutes,
  isValidTimeZone,
  normalizeCustomTimeZones,
  searchTimeZones,
} from './worldClockLogic';

describe('worldClockLogic', () => {
  it('validates IANA time zone IDs', () => {
    expect(isValidTimeZone('Europe/Helsinki')).toBe(true);
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
  });

  it('dedupes custom zones and excludes default clocks', () => {
    expect(
      normalizeCustomTimeZones([
        'Australia/Sydney',
        'Europe/Helsinki',
        'Australia/Sydney',
        'Not/AZone',
      ]),
    ).toEqual(['Australia/Sydney']);
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
