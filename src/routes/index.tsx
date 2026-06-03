import { createFileRoute } from '@tanstack/react-router';

import { ToolIndex } from '@/app/ToolIndex';

export const Route = createFileRoute('/')({
  component: ToolIndex,
});
