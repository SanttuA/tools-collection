import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Base64ConverterTool } from './Base64ConverterTool';

describe('Base64ConverterTool', () => {
  it('encodes text through labeled fields', async () => {
    const user = userEvent.setup();
    render(<Base64ConverterTool headingId="base64-heading" />);

    await user.type(screen.getByLabelText('Plain text'), 'Hello world');
    await user.click(screen.getByRole('button', { name: 'Encode to Base64' }));

    expect(screen.getByLabelText('Base64 text')).toHaveValue('SGVsbG8gd29ybGQ=');
  });

  it('decodes text through labeled fields', async () => {
    const user = userEvent.setup();
    render(<Base64ConverterTool headingId="base64-heading" />);

    await user.type(screen.getByLabelText('Base64 text'), 'SGVsbG8gd29ybGQ=');
    await user.click(screen.getByRole('button', { name: 'Decode from Base64' }));

    expect(screen.getByLabelText('Plain text')).toHaveValue('Hello world');
  });
});
