import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { ToolComponentProps } from '@/tools/types';

import {
  defaultWorldClocks,
  formatClockDisplay,
  getCanonicalTimeZone,
  getReadableTimeZoneLabel,
  getSupportedTimeZones,
  normalizeCustomTimeZones,
  readStoredTimeZones,
  searchTimeZones,
  writeStoredTimeZones,
  type WorldClockDefinition,
} from './worldClockLogic';

function WorldClockCard({
  clock,
  currentTime,
  onRemove,
}: {
  clock: WorldClockDefinition & { custom?: boolean };
  currentTime: Date;
  onRemove: (timeZone: string) => void;
}) {
  const display = formatClockDisplay(currentTime, clock.timeZone);

  return (
    <article className="world-clock-card" aria-label={`${clock.label} clock`}>
      <div className="world-clock-card-header">
        <div>
          <h2>{clock.label}</h2>
          <p>{clock.timeZone}</p>
        </div>
        {clock.custom ? (
          <button
            type="button"
            className="icon-button world-clock-remove"
            aria-label={`Remove ${clock.label}`}
            title={`Remove ${clock.label}`}
            onClick={() => onRemove(clock.timeZone)}
          >
            <Trash2 aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <time className="world-clock-time" dateTime={display.isoDateTime}>
        {display.timeLabel}
      </time>

      <dl className="world-clock-meta">
        <div>
          <dt>Date</dt>
          <dd>{display.dateLabel}</dd>
        </div>
        <div>
          <dt>Zone</dt>
          <dd>{display.timeZoneName}</dd>
        </div>
        <div>
          <dt>Offset</dt>
          <dd>{display.gmtOffset}</dd>
        </div>
      </dl>
    </article>
  );
}

export function WorldClocksTool({ headingId }: ToolComponentProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [customTimeZones, setCustomTimeZones] = useState(() => readStoredTimeZones());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const supportedTimeZones = useMemo(() => getSupportedTimeZones(), []);
  const displayedTimeZones = useMemo(
    () => [...defaultWorldClocks.map((clock) => clock.timeZone), ...customTimeZones],
    [customTimeZones],
  );
  const searchResults = useMemo(
    () => searchTimeZones(query, displayedTimeZones, supportedTimeZones),
    [displayedTimeZones, query, supportedTimeZones],
  );
  const clocks = useMemo(
    () => [
      ...defaultWorldClocks,
      ...customTimeZones.map((timeZone) => ({
        custom: true,
        label: getReadableTimeZoneLabel(timeZone),
        timeZone,
      })),
    ],
    [customTimeZones],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const persistCustomTimeZones = (nextTimeZones: string[]) => {
    const normalizedTimeZones = normalizeCustomTimeZones(nextTimeZones);

    setCustomTimeZones(normalizedTimeZones);
    return writeStoredTimeZones(normalizedTimeZones);
  };

  const addTimeZone = (timeZone: string) => {
    const canonicalTimeZone = getCanonicalTimeZone(timeZone);

    if (!canonicalTimeZone) {
      setStatus('Enter a valid IANA time zone.');
      return;
    }

    if (displayedTimeZones.includes(canonicalTimeZone)) {
      setStatus('That clock is already displayed.');
      return;
    }

    const persisted = persistCustomTimeZones([...customTimeZones, canonicalTimeZone]);
    const label = getReadableTimeZoneLabel(canonicalTimeZone);

    setQuery('');
    setStatus(persisted ? `Added ${label}.` : `Added ${label} for this session.`);
  };

  const removeTimeZone = (timeZone: string) => {
    const nextTimeZones = customTimeZones.filter((customTimeZone) => customTimeZone !== timeZone);
    const persisted = persistCustomTimeZones(nextTimeZones);

    setStatus(persisted ? 'Clock removed.' : 'Clock removed for this session.');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setStatus('Search for a time zone to add.');
      return;
    }

    addTimeZone(searchResults[0]?.timeZone ?? trimmedQuery);
  };

  return (
    <div className="tool-shell">
      <header className="tool-header">
        <div>
          <p className="eyebrow">Time</p>
          <h1 id={headingId}>World Clocks</h1>
          <p>Live 24-hour clocks powered by IANA time zones and browser DST rules.</p>
        </div>
      </header>

      <div className="tool-panel world-clock-controls">
        <form className="world-clock-form" onSubmit={handleSubmit}>
          <label className="field-block">
            <span className="field-label">Add time zone</span>
            <input
              aria-label="Search time zones"
              autoComplete="off"
              className="text-input"
              onChange={(event) => {
                setQuery(event.target.value);
                setStatus('');
              }}
              placeholder="Search city or IANA ID"
              type="search"
              value={query}
            />
          </label>
          <button type="submit" className="primary-button" disabled={!query.trim()}>
            <Plus aria-hidden="true" />
            Add first match
          </button>
        </form>

        {query.trim() ? (
          <div className="world-clock-search-panel">
            {searchResults.length > 0 ? (
              <ul className="world-clock-results" aria-label="Time zone search results">
                {searchResults.map((clock) => (
                  <li key={clock.timeZone}>
                    <button
                      type="button"
                      className="world-clock-result"
                      aria-label={`Add ${clock.label} (${clock.timeZone})`}
                      onClick={() => addTimeZone(clock.timeZone)}
                    >
                      <span>
                        <span className="world-clock-result-label">{clock.label}</span>
                        <span className="world-clock-result-zone">{clock.timeZone}</span>
                      </span>
                      <Plus aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="world-clock-empty-result">No matching time zones.</p>
            )}
          </div>
        ) : null}

        <p className="status-line" aria-live="polite">
          {status}
        </p>
      </div>

      <div className="world-clock-grid" aria-label="World clocks">
        {clocks.map((clock) => (
          <WorldClockCard
            key={clock.timeZone}
            clock={clock}
            currentTime={currentTime}
            onRemove={removeTimeZone}
          />
        ))}
      </div>
    </div>
  );
}
