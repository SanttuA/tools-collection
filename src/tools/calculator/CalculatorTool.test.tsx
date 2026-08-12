import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import { CalculatorTool } from './CalculatorTool';

describe('CalculatorTool', () => {
  it('calculates through accessible buttons', async () => {
    const screen = await render(<CalculatorTool headingId="calculator-heading" />);

    await screen.getByRole('button', { name: '7' }).click();
    await screen.getByRole('button', { name: 'Add' }).click();
    await screen.getByRole('button', { name: '8' }).click();
    await screen.getByRole('button', { name: 'Equals' }).click();

    await expect.element(screen.getByLabelText('Current calculation')).toHaveTextContent('7 + 8 =');
    await expect.element(screen.getByLabelText('Calculator display')).toHaveTextContent('15');
  });
});
