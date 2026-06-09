import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { UnitConverterTool } from './UnitConverterTool';

function getSelect(label: string) {
  return screen.getByLabelText<HTMLSelectElement>(label);
}

describe('UnitConverterTool', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('converts the default temperature pair', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool headingId="unit-converter-heading" />);

    await user.type(screen.getByLabelText('Value to convert'), '100');

    expect(screen.getByLabelText('Converted value')).toHaveTextContent('212');
    expect(screen.getByText('degF')).toBeVisible();
  });

  it('resets units when the category changes', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool headingId="unit-converter-heading" />);

    await user.selectOptions(getSelect('Conversion category'), 'length');
    await user.type(screen.getByLabelText('Value to convert'), '1');

    expect(getSelect('From unit').value).toBe('meter');
    expect(getSelect('To unit').value).toBe('foot');
    expect(screen.getByLabelText('Converted value')).toHaveTextContent('3.28083989501');
  });

  it('swaps and clears the active conversion', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool headingId="unit-converter-heading" />);

    await user.selectOptions(getSelect('Conversion category'), 'length');
    await user.type(screen.getByLabelText('Value to convert'), '1');
    await user.click(screen.getByRole('button', { name: 'Swap units' }));

    expect(getSelect('From unit').value).toBe('foot');
    expect(getSelect('To unit').value).toBe('meter');
    expect(screen.getByLabelText('Converted value')).toHaveTextContent('0.3048');

    await user.click(screen.getByRole('button', { name: 'Clear value' }));

    expect(screen.getByLabelText('Value to convert')).toHaveValue('');
    expect(screen.getByLabelText('Converted value')).toHaveTextContent('');
  });

  it('persists selected category and units across mounts', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<UnitConverterTool headingId="unit-converter-heading" />);

    await user.selectOptions(getSelect('Conversion category'), 'data');
    await user.selectOptions(getSelect('From unit'), 'gigabyte');
    await user.selectOptions(getSelect('To unit'), 'gibibyte');
    unmount();

    render(<UnitConverterTool headingId="unit-converter-heading" />);

    expect(getSelect('Conversion category').value).toBe('data');
    expect(getSelect('From unit').value).toBe('gigabyte');
    expect(getSelect('To unit').value).toBe('gibibyte');
  });

  it('shows an error when a conversion overflows', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool headingId="unit-converter-heading" />);

    await user.selectOptions(getSelect('Conversion category'), 'length');
    await user.selectOptions(getSelect('To unit'), 'millimeter');
    await user.type(screen.getByLabelText('Value to convert'), '1e308');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Converted value is too large to represent.',
    );
    expect(screen.getByLabelText('Converted value')).toHaveTextContent('');
  });
});
