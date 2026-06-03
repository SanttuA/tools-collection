import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { JsonFormatterTool } from './JsonFormatterTool';

describe('JsonFormatterTool', () => {
  it('formats JSON through labeled fields', async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool headingId="json-heading" />);

    fireEvent.change(screen.getByLabelText('JSON input'), {
      target: { value: '{"ok":true}' },
    });
    await user.click(screen.getByRole('button', { name: 'Format JSON' }));

    expect(screen.getByLabelText('JSON output')).toHaveValue('{\n  "ok": true\n}');
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool headingId="json-heading" />);

    fireEvent.change(screen.getByLabelText('JSON input'), {
      target: { value: '{bad' },
    });
    await user.click(screen.getByRole('button', { name: 'Format JSON' }));

    expect(screen.getByRole('alert')).toBeVisible();
  });
});
