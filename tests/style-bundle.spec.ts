import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('every screen ships the local Tailwind bundle instead of the CDN runtime', () => {
  for (const page of ['index.html', 'views/login.html', 'views/register.html', 'views/dashboard.html']) {
    const markup = readFileSync(resolve(__dirname, '..', page), 'utf8');
    expect(markup).toContain('tailwind.css');
    expect(markup).not.toContain('cdn.tailwindcss.com');
  }

  const styles = readFileSync(resolve(__dirname, '../css/tailwind.css'), 'utf8');
  expect(styles).toContain('.flex{display:flex}');
});
