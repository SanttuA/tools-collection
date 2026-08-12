import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { MarkdownPreviewerTool } from './MarkdownPreviewerTool';

describe('MarkdownPreviewerTool', () => {
  it('renders a live markdown preview from the input field', async () => {
    const screen = await render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    await screen.getByLabelText('Markdown input').fill('# Hello\n\n**Strong** copy');

    const preview = screen.getByLabelText('Markdown preview');
    await expect.element(preview.getByRole('heading', { name: 'Hello' })).toBeVisible();
    await expect.element(preview.getByText('Strong')).toBeVisible();
    await expect.element(screen.getByText('4 words, 24 characters.')).toBeVisible();
  });

  it('escapes raw HTML in the preview', async () => {
    const screen = await render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    await screen.getByLabelText('Markdown input').fill('<script>alert("x")</script>');

    const preview = screen.getByLabelText('Markdown preview');
    expect(preview.element().querySelector('script')).toBeNull();
    await expect.element(preview).toHaveTextContent('<script>alert("x")</script>');
  });

  it('clears markdown input and preview state', async () => {
    const screen = await render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    await screen.getByLabelText('Markdown input').fill('# Hello');
    await screen.getByRole('button', { name: 'Clear markdown' }).click();

    await expect.element(screen.getByLabelText('Markdown input')).toHaveValue('');
    await expect.element(screen.getByText('Preview appears here.')).toBeVisible();
  });
});
