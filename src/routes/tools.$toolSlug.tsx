import { createFileRoute } from '@tanstack/react-router';

import { ToolRoute } from '@/app/ToolRoute';

export const Route = createFileRoute('/tools/$toolSlug')({
  component: ToolRoute,
});
