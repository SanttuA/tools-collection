import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WorldClocksTool } from './WorldClocksTool';
import { defaultWorldClocks, worldClocksStorageKey } from './worldClockLogic';

describe('WorldClocksTool', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({
      now: new Date('2026-06-06T12:34:56Z'),
      shouldAdvanceTime: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders the default clocks on first open', () => {
    render(<WorldClocksTool headingId="world-clocks-heading" />);

    for (const clock of defaultWorldClocks) {
      expect(screen.getByRole('article', { name: `${clock.label} clock` })).toBeVisible();
    }

    expect(screen.getByRole('article', { name: 'Finland clock' })).toHaveTextContent(
      'Europe/Helsinki',
    );
    expect(screen.getByRole('article', { name: 'GMT / UTC clock' })).toHaveTextContent('GMT');
  });

  it('searches and adds a custom time zone', () => {
    render(<WorldClocksTool headingId="world-clocks-heading" />);

    fireEvent.change(screen.getByLabelText('Search time zones'), {
      target: { value: 'Sydney' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add Sydney, Australia/ }));

    expect(screen.getByRole('article', { name: 'Sydney, Australia clock' })).toBeVisible();
    expect(JSON.parse(localStorage.getItem(worldClocksStorageKey) ?? '[]')).toEqual([
      'Australia/Sydney',
    ]);
  });

  it('prevents duplicate clocks', () => {
    render(<WorldClocksTool headingId="world-clocks-heading" />);

    fireEvent.change(screen.getByLabelText('Search time zones'), {
      target: { value: 'Europe/Helsinki' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add first match' }));

    expect(screen.getByText('That clock is already displayed.')).toBeVisible();
    expect(screen.getAllByText('Europe/Helsinki')).toHaveLength(1);
  });

  it.each([
    ['europe/helsinki', 'Finland clock'],
    ['GMT', 'GMT / UTC clock'],
    ['US/Eastern', 'US Eastern clock'],
  ])('prevents duplicate clocks from %s', (submittedTimeZone, defaultClockName) => {
    render(<WorldClocksTool headingId="world-clocks-heading" />);

    fireEvent.change(screen.getByLabelText('Search time zones'), {
      target: { value: submittedTimeZone },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add first match' }));

    expect(screen.getByText('That clock is already displayed.')).toBeVisible();
    expect(screen.getByRole('article', { name: defaultClockName })).toBeVisible();
    expect(localStorage.getItem(worldClocksStorageKey)).toBeNull();
  });

  it('loads persisted custom clocks', () => {
    localStorage.setItem(worldClocksStorageKey, JSON.stringify(['Australia/Sydney']));

    render(<WorldClocksTool headingId="world-clocks-heading" />);

    expect(screen.getByRole('article', { name: 'Sydney, Australia clock' })).toBeVisible();
  });

  it('removes custom clocks', () => {
    localStorage.setItem(worldClocksStorageKey, JSON.stringify(['Australia/Sydney']));

    render(<WorldClocksTool headingId="world-clocks-heading" />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Sydney, Australia' }));

    expect(
      screen.queryByRole('article', { name: 'Sydney, Australia clock' }),
    ).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(worldClocksStorageKey) ?? '[]')).toEqual([]);
  });

  it('ticks once per second', () => {
    render(<WorldClocksTool headingId="world-clocks-heading" />);

    const finlandClock = screen.getByRole('article', { name: 'Finland clock' });
    expect(within(finlandClock).getByText('15:34:56')).toBeVisible();

    act(() => vi.advanceTimersByTime(1000));

    expect(within(finlandClock).getByText('15:34:57')).toBeVisible();
  });
});
