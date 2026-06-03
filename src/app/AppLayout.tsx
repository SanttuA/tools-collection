import { Link, Outlet } from '@tanstack/react-router';
import { Home, Search } from 'lucide-react';

import { tools } from '@/tools/registry';

export function AppLayout() {
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
          <Search aria-hidden="true" className="mobile-search-icon" />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
