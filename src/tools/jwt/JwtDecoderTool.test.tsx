import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { JwtDecoderTool } from './JwtDecoderTool';

const tokenWithClaims =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNzAwMDAwMDAwLCJuYmYiOjE3MDAwMDAxMDAsImV4cCI6MjAwMDAwMDAwMH0.signature';

describe('JwtDecoderTool', () => {
  it('decodes a JWT through labeled fields', async () => {
    const user = userEvent.setup();
    render(<JwtDecoderTool headingId="jwt-heading" />);

    fireEvent.change(screen.getByLabelText('JWT token'), {
      target: { value: tokenWithClaims },
    });
    await user.click(screen.getByRole('button', { name: 'Decode JWT' }));

    expect(screen.getByLabelText('Decoded header')).toHaveValue(
      '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
    );
    expect(screen.getByLabelText('Decoded payload')).toHaveValue(
      '{\n  "sub": "123",\n  "name": "Ada",\n  "iat": 1700000000,\n  "nbf": 1700000100,\n  "exp": 2000000000\n}',
    );
    expect(screen.getByText(/Signature is decoded but not verified/)).toBeVisible();
  });

  it('renders claim timing hints', async () => {
    const user = userEvent.setup();
    render(<JwtDecoderTool headingId="jwt-heading" />);

    fireEvent.change(screen.getByLabelText('JWT token'), {
      target: { value: tokenWithClaims },
    });
    await user.click(screen.getByRole('button', { name: 'Decode JWT' }));

    expect(screen.getByText(/Valid until 2033-05-18T03:33:20.000Z/)).toBeVisible();
    expect(screen.getByText(/Not valid before 2023-11-14T22:15:00.000Z/)).toBeVisible();
    expect(screen.getByText(/Issued at 2023-11-14T22:13:20.000Z/)).toBeVisible();
  });

  it('shows malformed-token errors', async () => {
    const user = userEvent.setup();
    render(<JwtDecoderTool headingId="jwt-heading" />);

    fireEvent.change(screen.getByLabelText('JWT token'), {
      target: { value: 'only.two' },
    });
    await user.click(screen.getByRole('button', { name: 'Decode JWT' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'JWT must have three dot-separated segments.',
    );
  });
});
