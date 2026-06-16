const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const checkedFiles = [
  'README.md',
  'app/page.tsx',
  'app/planner/page.tsx',
  'app/history/page.tsx',
  'app/trips/[id]/page.tsx',
  'app/admin/page.tsx',
  'app/api/trips/[id]/route.ts',
  'app/api/trips/[id]/regenerate/route.ts',
  'components/ItineraryView.tsx',
  'lib/agent.ts',
  'lib/mock-generator.ts',
  'lib/validation.ts'
];

test('user-facing copy does not contain mojibake artifacts', () => {
  const offenders = [];

  for (const relativePath of checkedFiles) {
    const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
    if (/[�]|[鐢熸垚]|[瑙勫垝]|[杈撳叆]|[鏃呰]|[鍘嗗彶]|[娌℃湁]|[鎴愬姛]/.test(content)) {
      offenders.push(relativePath);
    }
  }

  assert.deepEqual(offenders, []);
});

test('both planning endpoints use the shared failed-run provider helper', () => {
  const planRoute = fs.readFileSync(path.join(root, 'app/api/trips/plan/route.ts'), 'utf8');
  const regenerateRoute = fs.readFileSync(path.join(root, 'app/api/trips/[id]/regenerate/route.ts'), 'utf8');

  assert.match(planRoute, /getFailureProvider\(process\.env\)/);
  assert.match(regenerateRoute, /getFailureProvider\(process\.env\)/);
});

test('Supabase-backed read APIs are always dynamic', () => {
  const historyRoute = fs.readFileSync(path.join(root, 'app/api/history/route.ts'), 'utf8');
  const adminRoute = fs.readFileSync(path.join(root, 'app/api/admin/runs/route.ts'), 'utf8');

  assert.match(historyRoute, /dynamic\s*=\s*['"]force-dynamic['"]/);
  assert.match(adminRoute, /dynamic\s*=\s*['"]force-dynamic['"]/);
});
