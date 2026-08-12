import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { UnitConverterTool } from './UnitConverterTool';

describe('UnitConverterTool', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('converts the default temperature pair', async () => {
    const screen = await render(<UnitConverterTool headingId="unit-converter-heading" />);

    await screen.getByLabelText('Value to convert').fill('100');

    await expect.element(screen.getByLabelText('Converted value')).toHaveTextContent('212');
    await expect.element(screen.getByText('degF', { exact: true })).toBeVisible();
  });

  it('resets units when the category changes', async () => {
    const screen = await render(<UnitConverterTool headingId="unit-converter-heading" />);
    const category = screen.getByLabelText('Conversion category');
    const fromUnit = screen.getByLabelText('From unit');
    const toUnit = screen.getByLabelText('To unit');

    await category.selectOptions('length');
    await screen.getByLabelText('Value to convert').fill('1');

    await expect.element(fromUnit).toHaveValue('meter');
    await expect.element(toUnit).toHaveValue('foot');
    await expect
      .element(screen.getByLabelText('Converted value'))
      .toHaveTextContent('3.28083989501');
  });

  it('converts provider network speeds to download-app speeds', async () => {
    const screen = await render(<UnitConverterTool headingId="unit-converter-heading" />);
    const category = screen.getByLabelText('Conversion category');
    const fromUnit = screen.getByLabelText('From unit');
    const toUnit = screen.getByLabelText('To unit');

    await category.selectOptions('network-speed');
    await screen.getByLabelText('Value to convert').fill('100');

    await expect.element(fromUnit).toHaveValue('megabit-per-second');
    await expect.element(toUnit).toHaveValue('megabyte-per-second');
    await expect.element(screen.getByLabelText('Converted value')).toHaveTextContent('12.5');
    await expect.element(screen.getByText('MB/s', { exact: true })).toBeVisible();
  });

  it('swaps and clears the active conversion', async () => {
    const screen = await render(<UnitConverterTool headingId="unit-converter-heading" />);
    const category = screen.getByLabelText('Conversion category');
    const fromUnit = screen.getByLabelText('From unit');
    const toUnit = screen.getByLabelText('To unit');

    await category.selectOptions('length');
    await screen.getByLabelText('Value to convert').fill('1');
    await screen.getByRole('button', { name: 'Swap units' }).click();

    await expect.element(fromUnit).toHaveValue('foot');
    await expect.element(toUnit).toHaveValue('meter');
    await expect.element(screen.getByLabelText('Converted value')).toHaveTextContent('0.3048');

    await screen.getByRole('button', { name: 'Clear value' }).click();

    await expect.element(screen.getByLabelText('Value to convert')).toHaveValue('');
    await expect.element(screen.getByLabelText('Converted value')).toHaveTextContent('');
  });

  it('persists selected category and units across mounts', async () => {
    const firstScreen = await render(<UnitConverterTool headingId="unit-converter-heading" />);
    const category = firstScreen.getByLabelText('Conversion category');
    const fromUnit = firstScreen.getByLabelText('From unit');
    const toUnit = firstScreen.getByLabelText('To unit');

    await category.selectOptions('data');
    await fromUnit.selectOptions('gigabyte');
    await toUnit.selectOptions('gibibyte');
    await firstScreen.unmount();

    const secondScreen = await render(<UnitConverterTool headingId="unit-converter-heading" />);

    await expect.element(secondScreen.getByLabelText('Conversion category')).toHaveValue('data');
    await expect.element(secondScreen.getByLabelText('From unit')).toHaveValue('gigabyte');
    await expect.element(secondScreen.getByLabelText('To unit')).toHaveValue('gibibyte');
  });

  it('shows an error when a conversion overflows', async () => {
    const screen = await render(<UnitConverterTool headingId="unit-converter-heading" />);

    await screen.getByLabelText('Conversion category').selectOptions('length');
    await screen.getByLabelText('To unit').selectOptions('millimeter');
    await screen.getByLabelText('Value to convert').fill('1e308');

    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('Converted value is too large to represent.');
    await expect.element(screen.getByLabelText('Converted value')).toHaveTextContent('');
  });
});
