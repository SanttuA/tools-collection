import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CalculatorTool } from './CalculatorTool';

describe('CalculatorTool', () => {
  it('calculates through accessible buttons', async () => {
    const user = userEvent.setup();
    render(<CalculatorTool headingId="calculator-heading" />);

    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Equals' }));

    expect(screen.getByLabelText('Calculator display')).toHaveTextContent('15');
  });
});
