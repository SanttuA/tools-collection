import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HtmlValidatorTool } from './HtmlValidatorTool';

describe('HtmlValidatorTool', () => {
  it('validates HTML through labeled fields', async () => {
    const user = userEvent.setup();
    render(<HtmlValidatorTool headingId="html-heading" />);

    fireEvent.change(screen.getByLabelText('HTML input'), {
      target: {
        value:
          '<!DOCTYPE html><html lang="en"><head><title>Valid</title></head><body><main><h1>Valid</h1></main></body></html>',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Validate HTML' }));

    expect(await screen.findByText('HTML is valid.')).toBeVisible();
    expect(screen.getByLabelText('Validation report')).toHaveValue(
      'No HTML validation issues found.',
    );
  });

  it('shows validation errors in the report', async () => {
    const user = userEvent.setup();
    render(<HtmlValidatorTool headingId="html-heading" />);

    fireEvent.change(screen.getByLabelText('HTML input'), {
      target: {
        value:
          '<!DOCTYPE html><html lang="en"><head><title>Bad</title></head><body><input type="text"></input></body></html>',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Validate HTML' }));

    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.getByLabelText<HTMLTextAreaElement>('Validation report').value).toContain(
      'void-content',
    );
  });

  it('clears input and report state', async () => {
    const user = userEvent.setup();
    render(<HtmlValidatorTool headingId="html-heading" />);

    fireEvent.change(screen.getByLabelText('HTML input'), {
      target: {
        value:
          '<!DOCTYPE html><html lang="en"><head><title>Valid</title></head><body><main><h1>Valid</h1></main></body></html>',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Validate HTML' }));
    await screen.findByText('HTML is valid.');
    await user.click(screen.getByRole('button', { name: 'Clear HTML' }));

    expect(screen.getByLabelText('HTML input')).toHaveValue('');
    expect(screen.getByLabelText('Validation report')).toHaveValue('');
  });
});
