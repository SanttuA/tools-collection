import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { HtmlValidatorTool } from './HtmlValidatorTool';

describe('HtmlValidatorTool', () => {
  it('validates HTML through labeled fields', async () => {
    const screen = await render(<HtmlValidatorTool headingId="html-heading" />);

    await screen
      .getByLabelText('HTML input')
      .fill(
        '<!DOCTYPE html><html lang="en"><head><title>Valid</title></head><body><main><h1>Valid</h1></main></body></html>',
      );
    await screen.getByRole('button', { name: 'Validate HTML' }).click();

    await expect.element(screen.getByText('HTML is valid.')).toBeVisible();
    await expect
      .element(screen.getByLabelText('Validation report'))
      .toHaveValue('No HTML validation issues found.');
  });

  it('shows validation errors in the report', async () => {
    const screen = await render(<HtmlValidatorTool headingId="html-heading" />);

    await screen
      .getByLabelText('HTML input')
      .fill(
        '<!DOCTYPE html><html lang="en"><head><title>Bad</title></head><body><input type="text"></input></body></html>',
      );
    await screen.getByRole('button', { name: 'Validate HTML' }).click();

    await expect.element(screen.getByRole('alert')).toBeVisible();
    expect(
      (screen.getByLabelText('Validation report').element() as HTMLTextAreaElement).value,
    ).toContain('void-content');
  });

  it('clears input and report state', async () => {
    const screen = await render(<HtmlValidatorTool headingId="html-heading" />);

    await screen
      .getByLabelText('HTML input')
      .fill(
        '<!DOCTYPE html><html lang="en"><head><title>Valid</title></head><body><main><h1>Valid</h1></main></body></html>',
      );
    await screen.getByRole('button', { name: 'Validate HTML' }).click();
    await expect.element(screen.getByText('HTML is valid.')).toBeVisible();
    await screen.getByRole('button', { name: 'Clear HTML' }).click();

    await expect.element(screen.getByLabelText('HTML input')).toHaveValue('');
    await expect.element(screen.getByLabelText('Validation report')).toHaveValue('');
  });
});
