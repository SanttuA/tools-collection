import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LoremIpsumGeneratorTool } from './LoremIpsumGeneratorTool';

describe('LoremIpsumGeneratorTool', () => {
  it('renders generated paragraphs by default', () => {
    render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);
    const output = screen.getByLabelText<HTMLTextAreaElement>('Generated text');

    expect(screen.getByRole('heading', { name: 'Lorem Ipsum Generator' })).toBeVisible();
    expect(output.value).toMatch(/^Lorem ipsum dolor sit amet/);
    expect(screen.getByText('3 paragraphs')).toBeVisible();
  });

  it('generates words through labeled controls', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);

    await user.click(screen.getByLabelText('Words'));
    await user.clear(screen.getByLabelText('Count'));
    await user.type(screen.getByLabelText('Count'), '8');

    expect(screen.getByLabelText('Generated text')).toHaveValue(
      'Lorem ipsum dolor sit amet velit consectetur duis',
    );
    expect(screen.getByText('8 words')).toBeVisible();
  });

  it('can skip the Lorem ipsum opening', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);

    await user.click(screen.getByLabelText('Words'));
    await user.clear(screen.getByLabelText('Count'));
    await user.type(screen.getByLabelText('Count'), '8');
    await user.click(screen.getByLabelText('Start with Lorem ipsum'));

    expect(screen.getByLabelText('Generated text')).toHaveValue(
      'Velit consectetur duis est est ad voluptate pariatur',
    );
  });

  it('regenerates and clears output', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGeneratorTool headingId="lorem-heading" />);
    const output = screen.getByLabelText<HTMLTextAreaElement>('Generated text');
    const initialOutput = output.value;

    await user.click(screen.getByRole('button', { name: 'Regenerate text' }));

    expect(output).not.toHaveValue(initialOutput);

    await user.click(screen.getByRole('button', { name: 'Clear text' }));

    expect(output).toHaveValue('');
    expect(screen.getByText('0 words')).toBeVisible();
  });
});
