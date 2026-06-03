import { Link } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';

export function NotFoundView() {
  return (
    <section className="empty-state" aria-labelledby="not-found-heading">
      <AlertTriangle aria-hidden="true" className="empty-icon" />
      <h1 id="not-found-heading">Page not found</h1>
      <p>The requested route does not match an available tool.</p>
      <Link to="/" className="primary-link">
        Back to tools
      </Link>
    </section>
  );
}
