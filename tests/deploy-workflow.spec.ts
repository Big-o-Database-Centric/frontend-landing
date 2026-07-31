import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('frontend deployment validates a candidate and restores the previous container', () => {
  const workflow = readFileSync(resolve(__dirname, '../.github/workflows/deploy.yml'), 'utf8');

  expect(workflow).toContain('frontend-landing-candidate');
  expect(workflow).toContain('nginx -t');
  expect(workflow).toContain('docker rename frontend-landing frontend-landing-previous');
  expect(workflow).toContain('docker start frontend-landing-previous');
  expect(workflow).toContain('docker inspect frontend-landing-previous');
  expect(workflow).toContain('docker rename frontend-landing-previous frontend-landing');
});
