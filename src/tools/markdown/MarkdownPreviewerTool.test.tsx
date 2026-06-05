import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { MarkdownPreviewerTool } from './MarkdownPreviewerTool';

describe('MarkdownPreviewerTool', () => {
  it('renders a live markdown preview from the input field', () => {
    render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    fireEvent.change(screen.getByLabelText('Markdown input'), {
      target: { value: '# Hello\n\n**Strong** copy' },
    });

    const preview = screen.getByLabelText('Markdown preview');
    expect(within(preview).getByRole('heading', { name: 'Hello' })).toBeVisible();
    expect(within(preview).getByText('Strong')).toBeVisible();
    expect(screen.getByText('4 words, 24 characters.')).toBeVisible();
  });

  it('escapes raw HTML in the preview', () => {
    render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    fireEvent.change(screen.getByLabelText('Markdown input'), {
      target: { value: '<script>alert("x")</script>' },
    });

    const preview = screen.getByLabelText('Markdown preview');
    expect(preview.querySelector('script')).toBeNull();
    expect(preview).toHaveTextContent('<script>alert("x")</script>');
  });

  it('clears markdown input and preview state', async () => {
    const user = userEvent.setup();
    render(<MarkdownPreviewerTool headingId="markdown-heading" />);

    fireEvent.change(screen.getByLabelText('Markdown input'), {
      target: { value: '# Hello' },
    });
    await user.click(screen.getByRole('button', { name: 'Clear markdown' }));

    expect(screen.getByLabelText('Markdown input')).toHaveValue('');
    expect(screen.getByText('Preview appears here.')).toBeVisible();
  });
});
