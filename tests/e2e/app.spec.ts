import { expect, test, type Page } from '@playwright/test';

async function expectTheme(page: Page, theme: 'dark' | 'light') {
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

const jwtWithClaims =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNzAwMDAwMDAwLCJuYmYiOjE3MDAwMDAxMDAsImV4cCI6MjAwMDAwMDAwMH0.signature';

test('navigates between the registered tools', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'Tools' })).toBeVisible();
  await page
    .locator('.tool-grid')
    .getByRole('link', { name: /JSON Formatter/ })
    .click();
  await expect(page).toHaveURL(/#\/tools\/json-formatter$/);
  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible();
});

test('supports direct calculator hash links and keyboard input', async ({ page }) => {
  await page.goto('./#/tools/calculator');
  await expect(page.getByRole('heading', { name: 'Calculator' })).toBeVisible();

  await page.keyboard.press('7');
  await page.keyboard.press('+');
  await page.keyboard.press('8');
  await page.keyboard.press('Enter');

  await expect(page.getByLabel('Current calculation')).toHaveText('7 + 8 =');
  await expect(page.getByLabel('Calculator display')).toHaveText('15');
});

test('defaults to dark mode and persists theme changes', async ({ page }) => {
  await page.goto('./');

  await expectTheme(page, 'dark');

  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expectTheme(page, 'light');

  await page.reload();
  await expectTheme(page, 'light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expectTheme(page, 'dark');
});

test('formats JSON', async ({ page }) => {
  await page.goto('./#/tools/json-formatter');

  await page.getByLabel('JSON input').fill('{"name":"Ada","items":[1,2]}');
  await page.getByRole('button', { name: 'Format JSON' }).click();

  await expect(page.getByLabel('JSON output')).toHaveValue(
    '{\n  "name": "Ada",\n  "items": [\n    1,\n    2\n  ]\n}',
  );
});

test('converts Base64 text', async ({ page }) => {
  await page.goto('./#/tools/base64-converter');

  await page.getByLabel('Plain text').fill('Hello world');
  await page.getByRole('button', { name: 'Encode to Base64' }).click();
  await expect(page.getByLabel('Base64 text')).toHaveValue('SGVsbG8gd29ybGQ=');

  await page.getByLabel('Plain text').fill('');
  await page.getByRole('button', { name: 'Decode from Base64' }).click();
  await expect(page.getByLabel('Plain text')).toHaveValue('Hello world');
});

test('validates HTML', async ({ page }) => {
  await page.goto('./#/tools/html-validator');

  await expect(page.getByRole('heading', { name: 'HTML Validator' })).toBeVisible();
  await page
    .getByLabel('HTML input')
    .fill(
      '<!DOCTYPE html><html lang="en"><head><title>Bad</title></head><body><input type="text"></input></body></html>',
    );
  await page.getByRole('button', { name: 'Validate HTML' }).click();

  await expect(page.getByRole('alert')).toContainText('HTML has');
  await expect(page.getByLabel('Validation report')).toHaveValue(/void-content/);
});

test('previews Markdown', async ({ page }) => {
  await page.goto('./#/tools/markdown-previewer');

  await expect(page.getByRole('heading', { name: 'Markdown Previewer' })).toBeVisible();
  await page.getByLabel('Markdown input').fill('# Hello\n\n**Strong** copy');

  const preview = page.getByLabel('Markdown preview');
  await expect(preview.getByRole('heading', { name: 'Hello' })).toBeVisible();
  await expect(preview.locator('strong')).toHaveText('Strong');
});

test('decodes JWTs', async ({ page }) => {
  await page.goto('./#/tools/jwt-decoder');

  await expect(page.getByRole('heading', { name: 'JWT Decoder' })).toBeVisible();
  await page.getByLabel('JWT token').fill(jwtWithClaims);
  await page.getByRole('button', { name: 'Decode JWT' }).click();

  await expect(page.getByLabel('Decoded header')).toHaveValue(
    '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
  );
  await expect(page.getByLabel('Decoded payload')).toHaveValue(/"name": "Ada"/);
  await expect(page.getByText(/Signature is decoded but not verified/)).toBeVisible();
});
