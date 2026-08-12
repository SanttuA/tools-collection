import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

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
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders the default clocks on first open', async () => {
    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    await Promise.all(
      defaultWorldClocks.map(async (clock) => {
        await expect
          .element(screen.getByRole('article', { name: `${clock.label} clock` }))
          .toBeVisible();
      }),
    );

    await expect
      .element(screen.getByRole('article', { name: 'Finland clock' }))
      .toHaveTextContent('Europe/Helsinki');
    await expect
      .element(screen.getByRole('article', { name: 'GMT / UTC clock' }))
      .toHaveTextContent('GMT');
  });

  it('searches and adds a custom time zone', async () => {
    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    await screen.getByLabelText('Search time zones').fill('Sydney');
    await screen.getByRole('button', { name: /Add Sydney, Australia/ }).click();

    await expect
      .element(screen.getByRole('article', { name: 'Sydney, Australia clock' }))
      .toBeVisible();
    expect(JSON.parse(localStorage.getItem(worldClocksStorageKey) ?? '[]')).toEqual([
      'Australia/Sydney',
    ]);
  });

  it('prevents duplicate clocks', async () => {
    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    await screen.getByLabelText('Search time zones').fill('Europe/Helsinki');
    await screen.getByRole('button', { name: 'Add first match' }).click();

    await expect.element(screen.getByText('That clock is already displayed.')).toBeVisible();
    expect(screen.getByText('Europe/Helsinki').length).toBe(1);
  });

  it.each([
    ['europe/helsinki', 'Finland clock'],
    ['Zulu', 'GMT / UTC clock'],
    ['US/Eastern', 'US Eastern clock'],
  ])('prevents duplicate clocks from %s', async (submittedTimeZone, defaultClockName) => {
    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    await screen.getByLabelText('Search time zones').fill(submittedTimeZone);
    await screen.getByRole('button', { name: 'Add first match' }).click();

    await expect.element(screen.getByText('That clock is already displayed.')).toBeVisible();
    await expect.element(screen.getByRole('article', { name: defaultClockName })).toBeVisible();
    expect(localStorage.getItem(worldClocksStorageKey)).toBeNull();
  });

  it('loads persisted custom clocks', async () => {
    localStorage.setItem(worldClocksStorageKey, JSON.stringify(['Australia/Sydney']));

    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    await expect
      .element(screen.getByRole('article', { name: 'Sydney, Australia clock' }))
      .toBeVisible();
  });

  it('removes custom clocks', async () => {
    localStorage.setItem(worldClocksStorageKey, JSON.stringify(['Australia/Sydney']));

    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);
    await screen.getByRole('button', { name: 'Remove Sydney, Australia' }).click();

    await expect
      .element(screen.getByRole('article', { name: 'Sydney, Australia clock' }))
      .not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(worldClocksStorageKey) ?? '[]')).toEqual([]);
  });

  it('ticks once per second', async () => {
    const screen = await render(<WorldClocksTool headingId="world-clocks-heading" />);

    const finlandClock = screen.getByRole('article', { name: 'Finland clock' });
    await expect.element(finlandClock.getByText('15:34:56')).toBeVisible();

    await vi.advanceTimersByTimeAsync(1000);

    await expect.element(finlandClock.getByText('15:34:57')).toBeVisible();
  });
});
