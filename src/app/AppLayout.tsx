import { Link, Outlet } from '@tanstack/react-router';
import { Home, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { tools } from '@/tools/registry';

type ThemeMode = 'dark' | 'light';

const themeStorageKey = 'tools-collection-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const storedTheme = localStorage.getItem(themeStorageKey);

    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  } catch {
    return 'dark';
  }
}

type ThemeToggleProps = {
  mode: ThemeMode;
  onToggle: () => void;
};

function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  const isDark = mode === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" />
      <span aria-hidden="true">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export function AppLayout() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;

    try {
      localStorage.setItem(themeStorageKey, themeMode);
    } catch {
      // Keep the active theme even if persisted storage is unavailable.
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            TC
          </div>
          <div>
            <p className="brand-title">Tools Collection</p>
            <p className="brand-meta">{tools.length} tools</p>
          </div>
        </div>

        <ThemeToggle mode={themeMode} onToggle={toggleTheme} />

        <nav className="nav-list" aria-label="Tools">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link active' }}
            activeOptions={{ exact: true }}
          >
            <Home aria-hidden="true" className="nav-icon" />
            All tools
          </Link>
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.slug}
                to="/tools/$toolSlug"
                params={{ toolSlug: tool.slug }}
                className="nav-link"
                activeProps={{ className: 'nav-link active' }}
              >
                <Icon aria-hidden="true" className="nav-icon" />
                {tool.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-panel">
        <div className="mobile-bar" aria-label="Current app">
          <div className="brand compact">
            <div className="brand-mark" aria-hidden="true">
              TC
            </div>
            <p className="brand-title">Tools Collection</p>
          </div>
          <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
