import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { LoremIpsumGeneratorTool } from './LoremIpsumGeneratorTool';

describe('LoremIpsumGeneratorTool', () => {
  it('renders generated paragraphs by default', async () => {
    const screen = await render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);
    const output = screen.getByLabelText('Generated text', { exact: true });

    await expect
      .element(screen.getByRole('heading', { name: 'Lorem Ipsum Generator' }))
      .toBeVisible();
    expect((output.element() as HTMLTextAreaElement).value).toMatch(/^Lorem ipsum dolor sit amet/);
    await expect.element(screen.getByText('3 paragraphs')).toBeVisible();
  });

  it('generates words through labeled controls', async () => {
    const screen = await render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);

    await screen.getByLabelText('Words').click();
    await screen.getByLabelText('Count').fill('8');

    await expect
      .element(screen.getByLabelText('Generated text', { exact: true }))
      .toHaveValue('Lorem ipsum dolor sit amet velit consectetur duis');
    await expect.element(screen.getByText('8 words')).toBeVisible();
  });

  it('can skip the Lorem ipsum opening', async () => {
    const screen = await render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);

    await screen.getByLabelText('Words').click();
    await screen.getByLabelText('Count').fill('8');
    await screen.getByLabelText('Start with Lorem ipsum').click();

    await expect
      .element(screen.getByLabelText('Generated text', { exact: true }))
      .toHaveValue('Velit consectetur duis est est ad voluptate pariatur');
  });

  it('regenerates and clears output', async () => {
    const screen = await render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);
    const output = screen.getByLabelText('Generated text', { exact: true });
    const initialOutput = (output.element() as HTMLTextAreaElement).value;

    await screen.getByRole('button', { name: 'Regenerate text' }).click();

    await expect.element(output).not.toHaveValue(initialOutput);

    await screen.getByRole('button', { name: 'Clear text' }).click();

    await expect.element(output).toHaveValue('');
    await expect.element(screen.getByText('0 words')).toBeVisible();
  });
});
