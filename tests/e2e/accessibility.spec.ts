import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'index', path: './' },
  { name: 'calculator', path: './#/tools/calculator' },
  { name: 'json formatter', path: './#/tools/json-formatter' },
  { name: 'base64 converter', path: './#/tools/base64-converter' },
  { name: 'html validator', path: './#/tools/html-validator' },
  { name: 'markdown previewer', path: './#/tools/markdown-previewer' },
  { name: 'lorem ipsum generator', path: './#/tools/lorem-ipsum-generator' },
  { name: 'jwt decoder', path: './#/tools/jwt-decoder' },
  { name: 'unit converter', path: './#/tools/unit-converter' },
  { name: 'world clocks', path: './#/tools/world-clocks' },
];

for (const route of routes) {
  test(`${route.name} has no automatically detectable accessibility issues`, async ({ page }) => {
    await page.goto(route.path);
    await page.locator('h1').first().waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
