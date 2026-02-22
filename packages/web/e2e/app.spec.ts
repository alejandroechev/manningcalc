import { test, expect, type Page } from '@playwright/test';

// Helper: wait for results to appear
async function waitForResults(page: Page) {
  await expect(page.locator('.results-table')).toBeVisible({ timeout: 5000 });
}

// Helper: get result value by label
async function getResultValue(page: Page, label: string): Promise<string> {
  const row = page.locator('.results-table tbody tr', { has: page.locator(`td:first-child`, { hasText: label }) });
  return (await row.locator('td:nth-child(2)').textContent()) ?? '';
}

// Helper: set an input field value
async function setField(page: Page, label: RegExp | string, value: string) {
  const input = page.locator('.form-group').filter({ hasText: label }).locator('input');
  await input.fill(value);
}

// ─── Core Workflow ──────────────────────────────────────────────────────

test.describe('Core Workflow', () => {
  test('page loads with default rectangle and shows results', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('manningcalc');

    // Default shape is rectangle
    const activeBtn = page.locator('.shape-btn.active');
    await expect(activeBtn).toContainText('Rectangle');

    // Results should be visible with default inputs
    await waitForResults(page);

    // Key results displayed
    const discharge = await getResultValue(page, 'Discharge (Q)');
    expect(parseFloat(discharge)).toBeGreaterThan(0);

    const normalDepth = await getResultValue(page, 'Normal Depth (y)');
    expect(parseFloat(normalDepth)).toBeGreaterThan(0);

    const velocity = await getResultValue(page, 'Velocity (V)');
    expect(parseFloat(velocity)).toBeGreaterThan(0);

    const froude = await getResultValue(page, 'Froude Number (Fr)');
    expect(parseFloat(froude)).toBeGreaterThan(0);

    const critDepth = await getResultValue(page, 'Critical Depth (yc)');
    expect(parseFloat(critDepth)).toBeGreaterThan(0);
  });

  test('cross-section SVG shows water level', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    // SVG diagram should be present with water fill
    const svg = page.locator('.diagram-container svg');
    await expect(svg).toBeVisible();

    // Water path should exist (blue fill)
    const waterPath = svg.locator('path[fill*="rgba"]');
    await expect(waterPath).toBeVisible();

    // Depth label should be visible
    const depthText = svg.locator('text');
    await expect(depthText).toContainText('y =');
  });
});

// ─── Shape Switching ────────────────────────────────────────────────────

test.describe('Shape Switching', () => {
  test('switch through all shapes and verify fields', async ({ page }) => {
    await page.goto('/');

    // Rectangle (default) - has Bottom Width, Flow Depth
    // Use locator filtering for input fields only (not the solve-for dropdown)
    const fieldWithInput = (text: string) =>
      page.locator('.form-group:not(.full)').filter({ hasText: text });

    await expect(page.locator('.shape-btn.active')).toContainText('Rectangle');
    await expect(fieldWithInput('Bottom Width')).toBeVisible();
    await expect(fieldWithInput('Flow Depth')).toBeVisible();
    await expect(fieldWithInput('Side Slope')).not.toBeVisible();
    await expect(fieldWithInput('Diameter')).not.toBeVisible();

    // Switch to Trapezoid
    await page.locator('.shape-btn', { hasText: 'Trapezoid' }).click();
    await expect(page.locator('.shape-btn.active')).toContainText('Trapezoid');
    await expect(fieldWithInput('Bottom Width')).toBeVisible();
    await expect(fieldWithInput('Side Slope')).toBeVisible();

    // Switch to Triangle
    await page.locator('.shape-btn', { hasText: 'Triangle' }).click();
    await expect(page.locator('.shape-btn.active')).toContainText('Triangle');
    await expect(fieldWithInput('Bottom Width')).not.toBeVisible();
    await expect(fieldWithInput('Side Slope')).toBeVisible();
    await expect(fieldWithInput('Diameter')).not.toBeVisible();

    // Switch to Circle
    await page.locator('.shape-btn', { hasText: 'Circle' }).click();
    await expect(page.locator('.shape-btn.active')).toContainText('Circle');
    await expect(fieldWithInput('Diameter')).toBeVisible();
    await expect(fieldWithInput('Bottom Width')).not.toBeVisible();
    await expect(fieldWithInput('Side Slope')).not.toBeVisible();
  });

  test('results recalculate for each shape', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    // Get rectangle discharge
    const rectQ = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    expect(rectQ).toBeGreaterThan(0);

    // Switch to trapezoid with same params
    await page.locator('.shape-btn', { hasText: 'Trapezoid' }).click();
    // Fill z for trapezoid
    await setField(page, 'Side Slope', '2');
    await waitForResults(page);
    const trapQ = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    expect(trapQ).toBeGreaterThan(0);
    // Trapezoid with side slopes should have larger discharge than rectangle with same b, y
    expect(trapQ).toBeGreaterThan(rectQ);

    // Switch to triangle
    await page.locator('.shape-btn', { hasText: 'Triangle' }).click();
    await setField(page, 'Side Slope', '4');
    await waitForResults(page);
    const triQ = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    expect(triQ).toBeGreaterThan(0);

    // Switch to circle
    await page.locator('.shape-btn', { hasText: 'Circle' }).click();
    await waitForResults(page);
    const circQ = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    expect(circQ).toBeGreaterThan(0);
  });

  test('cross-section SVG changes with shape', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator('.diagram-container svg');

    // Rectangle: channel path uses rect-like straight lines
    await expect(svg.locator('path').first()).toBeVisible();
    const rectPath = await svg.locator('path[fill="none"]').getAttribute('d');

    // Switch to circle
    await page.locator('.shape-btn', { hasText: 'Circle' }).click();
    await page.waitForTimeout(200);
    const circlePath = await svg.locator('path[fill="none"]').getAttribute('d');

    // Paths should differ (circle uses arc commands 'A')
    expect(circlePath).not.toBe(rectPath);
    expect(circlePath).toContain('A');
  });
});

// ─── Samples ────────────────────────────────────────────────────────────

test.describe('Samples', () => {
  const sampleTests = [
    { name: 'Concrete Rectangular Channel', shape: 'Rectangle', solveFor: 'Discharge' },
    { name: 'Earth Trapezoidal Canal', shape: 'Trapezoid', solveFor: 'Normal Depth' },
    { name: 'Grassed Waterway', shape: 'Triangle', solveFor: 'Discharge' },
    { name: 'Circular Storm Sewer', shape: 'Circle', solveFor: 'Discharge' },
    { name: 'Steep Mountain Stream', shape: 'Trapezoid', solveFor: 'Discharge' },
    { name: 'Large River Section', shape: 'Trapezoid', solveFor: 'Normal Depth' },
  ];

  for (const s of sampleTests) {
    test(`load sample: ${s.name}`, async ({ page }) => {
      await page.goto('/');

      // Open samples dropdown
      await page.locator('button', { hasText: 'Samples' }).click();
      await expect(page.locator('.dropdown-menu')).toBeVisible();

      // Click the sample
      await page.locator('.dropdown-item', { hasText: s.name }).click();

      // Shape should switch
      await expect(page.locator('.shape-btn.active')).toContainText(s.shape);

      // Solve-for should match
      const selectVal = await page.locator('select').inputValue();
      if (s.solveFor === 'Discharge') expect(selectVal).toBe('Q');
      if (s.solveFor === 'Normal Depth') expect(selectVal).toBe('y');

      // Results should appear
      await waitForResults(page);

      // Key results should be positive numbers
      const q = parseFloat(await getResultValue(page, 'Discharge (Q)'));
      expect(q).toBeGreaterThan(0);

      const y = parseFloat(await getResultValue(page, 'Normal Depth (y)'));
      expect(y).toBeGreaterThan(0);

      const v = parseFloat(await getResultValue(page, 'Velocity (V)'));
      expect(v).toBeGreaterThan(0);
    });
  }

  test('subcritical vs supercritical classification', async ({ page }) => {
    await page.goto('/');

    // Load concrete rectangular - should be subcritical
    await page.locator('button', { hasText: 'Samples' }).click();
    await page.locator('.dropdown-item', { hasText: 'Concrete Rectangular' }).click();
    await waitForResults(page);

    const regime1 = page.locator('.badge');
    await expect(regime1).toContainText('subcritical');
    const fr1 = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
    expect(fr1).toBeLessThan(1);

    // Load steep mountain stream - should be supercritical
    await page.locator('button', { hasText: 'Samples' }).click();
    await page.locator('.dropdown-item', { hasText: 'Steep Mountain' }).click();
    await waitForResults(page);

    const regime2 = page.locator('.badge');
    await expect(regime2).toContainText('supercritical');
    const fr2 = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
    expect(fr2).toBeGreaterThan(1);
  });
});

// ─── Input Validation ───────────────────────────────────────────────────

test.describe('Input Validation', () => {
  test('Manning n = 0 does not crash', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    await setField(page, "Manning's n", '0');
    await page.waitForTimeout(300);

    // Results should disappear or show error state, but page should not crash
    const hasResults = await page.locator('.results-table').isVisible().catch(() => false);
    if (!hasResults) {
      // Should show "Enter parameters" message
      await expect(page.locator('text=Enter parameters')).toBeVisible();
    }
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('manningcalc');
  });

  test('Slope = 0 does not crash', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    await setField(page, 'Slope', '0');
    await page.waitForTimeout(300);

    // Should not crash
    await expect(page.locator('h1')).toContainText('manningcalc');
  });

  test('negative dimensions handled gracefully', async ({ page }) => {
    await page.goto('/');

    await setField(page, 'Bottom Width', '-5');
    await page.waitForTimeout(300);

    // Should not crash - may show no results
    await expect(page.locator('h1')).toContainText('manningcalc');
  });

  test('very large discharge still computes', async ({ page }) => {
    await page.goto('/');

    // Switch solve-for to Normal Depth, provide large Q
    await page.locator('select').selectOption('y');
    await setField(page, 'Discharge', '100000');
    await setField(page, 'Bottom Width', '50');
    await setField(page, "Manning's n", '0.013');
    await setField(page, 'Slope', '0.001');
    await page.waitForTimeout(500);

    // Should compute a result
    await waitForResults(page);
    const y = parseFloat(await getResultValue(page, 'Normal Depth (y)'));
    expect(y).toBeGreaterThan(0);
  });
});

// ─── Results Accuracy ───────────────────────────────────────────────────

test.describe('Results Accuracy', () => {
  test('Froude < 1 for subcritical samples', async ({ page }) => {
    await page.goto('/');

    // Default concrete rect channel
    await page.locator('button', { hasText: 'Samples' }).click();
    await page.locator('.dropdown-item', { hasText: 'Concrete Rectangular' }).click();
    await waitForResults(page);

    const fr = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
    expect(fr).toBeLessThan(1);
    expect(fr).toBeGreaterThan(0);
  });

  test('Froude > 1 for supercritical steep mountain stream', async ({ page }) => {
    await page.goto('/');

    await page.locator('button', { hasText: 'Samples' }).click();
    await page.locator('.dropdown-item', { hasText: 'Steep Mountain' }).click();
    await waitForResults(page);

    const fr = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
    expect(fr).toBeGreaterThan(1);
  });

  test('default rectangle: Q ≈ 165 cfs (b=10, y=3, n=0.013, S=0.001)', async ({ page }) => {
    await page.goto('/');

    // Default: b=10, y=3, n=0.013, S=0.001
    await page.locator('button', { hasText: 'Samples' }).click();
    await page.locator('.dropdown-item', { hasText: 'Concrete Rectangular' }).click();
    await waitForResults(page);

    const q = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    // Manning's: Q = (1.49/n) * A * R^(2/3) * S^(1/2)
    // A=30, P=16, R=1.875, Q = (1.49/0.013)*30*1.875^(2/3)*0.001^(1/2) ≈ 165
    expect(q).toBeGreaterThan(155);
    expect(q).toBeLessThan(175);
  });

  test('velocity = Q / A relationship holds', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    const q = parseFloat(await getResultValue(page, 'Discharge (Q)'));
    const a = parseFloat(await getResultValue(page, 'Flow Area (A)'));
    const v = parseFloat(await getResultValue(page, 'Velocity (V)'));

    // V = Q / A within rounding tolerance
    expect(Math.abs(v - q / a)).toBeLessThan(0.1);
  });

  test('hydraulic radius = A / P', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    const a = parseFloat(await getResultValue(page, 'Flow Area (A)'));
    const p = parseFloat(await getResultValue(page, 'Wetted Perimeter (P)'));
    const r = parseFloat(await getResultValue(page, 'Hydraulic Radius (R)'));

    expect(Math.abs(r - a / p)).toBeLessThan(0.01);
  });
});

// ─── UI Features ────────────────────────────────────────────────────────

test.describe('UI Features', () => {
  test('theme toggle switches dark/light', async ({ page }) => {
    await page.goto('/');

    // Initial state should be light
    const html = page.locator('html');

    // Click theme toggle (moon emoji button)
    await page.locator('.btn-icon', { hasText: /🌙|☀️/ }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Click again to go back
    await page.locator('.btn-icon', { hasText: /🌙|☀️/ }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('Guide button exists', async ({ page }) => {
    await page.goto('/');
    const guideBtn = page.locator('button', { hasText: 'Guide' });
    await expect(guideBtn).toBeVisible();
  });

  test('Report button exists', async ({ page }) => {
    await page.goto('/');
    const reportBtn = page.locator('button', { hasText: 'Report' });
    await expect(reportBtn).toBeVisible();
  });

  test('Manning n reference table toggles', async ({ page }) => {
    await page.goto('/');

    // Toggle should exist
    const toggle = page.locator('.n-table-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText("Manning's n Reference");

    // Table should be hidden initially
    await expect(page.locator('.n-ref-table')).not.toBeVisible();

    // Click to open
    await toggle.click();
    await expect(page.locator('.n-ref-table')).toBeVisible();

    // Click to close
    await toggle.click();
    await expect(page.locator('.n-ref-table')).not.toBeVisible();
  });

  test('cross-section SVG is visible and has channel outline', async ({ page }) => {
    await page.goto('/');

    const svg = page.locator('.diagram-container svg');
    await expect(svg).toBeVisible();

    // Should have a channel outline path
    const channelPath = svg.locator('path[fill="none"]');
    await expect(channelPath).toBeVisible();
  });

  test('cross-section diagram is in the left panel', async ({ page }) => {
    await page.goto('/');
    const leftPanel = page.locator('.main-grid > div:first-child');
    const diagram = leftPanel.locator('.diagram-container');
    await expect(diagram).toBeVisible();
  });

  test('report opens in new tab with results', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('button', { hasText: 'Report' }).click(),
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toContainText('manningcalc Report');
    await expect(newPage.locator('table')).toBeVisible();
    await expect(newPage.locator('.hint')).toContainText('Ctrl+P');
    await expect(newPage.locator('.diagram svg')).toBeVisible();

    await newPage.close();
  });

  test('solve-for dropdown changes computed field', async ({ page }) => {
    await page.goto('/');
    await waitForResults(page);

    // Switch to solve for Normal Depth
    await page.locator('select').selectOption('y');

    // Flow Depth input should disappear (it's being solved for)
    await expect(page.locator('.form-group').filter({ hasText: 'Flow Depth' }).locator('input')).not.toBeVisible();

    // Discharge field should now appear as input
    await expect(page.locator('.form-group').filter({ hasText: 'Discharge' }).locator('input')).toBeVisible();
  });
});

// ── State Persistence & File Actions ─────────────────────────────────

test.describe('State Persistence', () => {
  test('form state persists across page reload', async ({ page }) => {
    await page.goto('/');
    // Switch to trapezoid shape
    await page.locator('.shape-btn', { hasText: 'Trapezoid' }).click();
    await waitForResults(page);
    // Wait for debounced save
    await page.waitForTimeout(700);
    // Reload
    await page.reload();
    await expect(page.locator('.shape-btn.active')).toContainText('Trapezoid');
  });

  test('New button resets to defaults', async ({ page }) => {
    await page.goto('/');
    await page.locator('.shape-btn', { hasText: 'Circle' }).click();
    await waitForResults(page);
    await page.locator('.toolbar button', { hasText: 'New' }).click();
    await expect(page.locator('.shape-btn.active')).toContainText('Rectangle');
  });

  test('Open and Save buttons exist', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.toolbar button', { hasText: 'Open' })).toBeVisible();
    await expect(page.locator('.toolbar button', { hasText: 'Save' })).toBeVisible();
  });

  test('toolbar button order: New, Open, Samples, Save, Report', async ({ page }) => {
    await page.goto('/');
    const actions = page.locator('.toolbar-actions > *');
    const texts = await actions.allTextContents();
    const newIdx = texts.findIndex(t => t.trim() === 'New');
    const openIdx = texts.findIndex(t => t.trim() === 'Open');
    const samplesIdx = texts.findIndex(t => t.includes('Samples'));
    const saveIdx = texts.findIndex(t => t.trim() === 'Save');
    const reportIdx = texts.findIndex(t => t.includes('Report'));
    expect(newIdx).toBeLessThan(openIdx);
    expect(openIdx).toBeLessThan(samplesIdx);
    expect(samplesIdx).toBeLessThan(saveIdx);
    expect(saveIdx).toBeLessThan(reportIdx);
  });
});
