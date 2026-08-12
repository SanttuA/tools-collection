import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { JsonFormatterTool } from './JsonFormatterTool';

describe('JsonFormatterTool', () => {
  it('formats JSON through labeled fields', async () => {
    const screen = await render(<JsonFormatterTool headingId="json-heading" />);

    await screen.getByLabelText('JSON input').fill('{"ok":true}');
    await screen.getByRole('button', { name: 'Format JSON' }).click();

    await expect.element(screen.getByLabelText('JSON output')).toHaveValue('{\n  "ok": true\n}');
  });

  it('shows validation errors', async () => {
    const screen = await render(<JsonFormatterTool headingId="json-heading" />);

    await screen.getByLabelText('JSON input').fill('{bad');
    await screen.getByRole('button', { name: 'Format JSON' }).click();

    await expect.element(screen.getByRole('alert')).toBeVisible();
  });
});
