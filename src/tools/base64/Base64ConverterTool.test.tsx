import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { Base64ConverterTool } from './Base64ConverterTool';

describe('Base64ConverterTool', () => {
  it('encodes text through labeled fields', async () => {
    const screen = await render(<Base64ConverterTool headingId="base64-heading" />);

    await screen.getByLabelText('Plain text').fill('Hello world');
    await screen.getByRole('button', { name: 'Encode to Base64' }).click();

    await expect.element(screen.getByLabelText('Base64 text')).toHaveValue('SGVsbG8gd29ybGQ=');
  });

  it('decodes text through labeled fields', async () => {
    const screen = await render(<Base64ConverterTool headingId="base64-heading" />);

    await screen.getByLabelText('Base64 text').fill('SGVsbG8gd29ybGQ=');
    await screen.getByRole('button', { name: 'Decode from Base64' }).click();

    await expect.element(screen.getByLabelText('Plain text')).toHaveValue('Hello world');
  });
});
