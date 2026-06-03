import { createRootRoute } from '@tanstack/react-router';

import { AppLayout } from '@/app/AppLayout';
import { NotFoundView } from '@/app/NotFoundView';

export const Route = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundView,
});
