import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { searchTools, tools } from '@/tools/registry';

export function ToolIndex() {
  const [query, setQuery] = useState('');
  const filteredTools = useMemo(() => searchTools(query), [query]);

  return (
    <section className="page-surface" aria-labelledby="tools-heading">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 id="tools-heading">Tools</h1>
        </div>
        <div className="search-field">
          <Search aria-hidden="true" />
          <input
            aria-label="Search tools"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
          />
        </div>
      </div>

      <div className="tool-grid" aria-label="Available tools">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.slug}
              to="/tools/$toolSlug"
              params={{ toolSlug: tool.slug }}
              className="tool-card"
            >
              <span className="tool-card-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="tool-card-body">
                <span className="tool-card-category">{tool.category}</span>
                <span className="tool-card-title">{tool.title}</span>
                <span className="tool-card-description">{tool.description}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 ? (
        <p className="empty-inline" aria-live="polite">
          No tools match "{query}". {tools.length} tools are available.
        </p>
      ) : null}
    </section>
  );
}
