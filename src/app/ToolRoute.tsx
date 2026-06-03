import { Link, useParams } from '@tanstack/react-router';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

import { getToolBySlug } from '@/tools/registry';

export function ToolRoute() {
  const { toolSlug } = useParams({ from: '/tools/$toolSlug' });
  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    return (
      <section className="empty-state" aria-labelledby="unknown-tool-heading">
        <AlertTriangle aria-hidden="true" className="empty-icon" />
        <h1 id="unknown-tool-heading">Tool not found</h1>
        <p>"{toolSlug}" is not registered in this collection.</p>
        <Link to="/" className="primary-link">
          Back to tools
        </Link>
      </section>
    );
  }

  const ToolComponent = tool.component;

  return (
    <section className="page-surface" aria-labelledby={`${tool.slug}-heading`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Tools</Link>
        <ChevronRight aria-hidden="true" />
        <span>{tool.title}</span>
      </nav>
      <Suspense fallback={<div className="loading-panel">Loading {tool.title}</div>}>
        <ToolComponent headingId={`${tool.slug}-heading`} />
      </Suspense>
    </section>
  );
}
