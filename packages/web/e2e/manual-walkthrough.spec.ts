import { test, expect, type Page } from '@playwright/test';

async function waitForResults(page: Page) {
  await expect(page.locator('.results-table')).toBeVisible({ timeout: 5000 });
}

async function getResultValue(page: Page, label: string): Promise<string> {
  const row = page.locator('.results-table tbody tr', { has: page.locator('td:first-child', { hasText: label }) });
  return (await row.locator('td:nth-child(2)').textContent()) ?? '';
}

// ─── 1. App Load ─────────────────────────────────────────────────────────

test('1. App loads with default results shown', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('manningcalc');

  // Default shape = rectangle
  await expect(page.locator('.shape-btn.active')).toContainText('Rectangle');

  // Default solve-for = Discharge
  const selectVal = await page.locator('select').inputValue();
  expect(selectVal).toBe('Q');

  // Default inputs visible: Bottom Width, Flow Depth, Manning's n, Slope
  const fieldWithInput = (text: string) =>
    page.locator('.form-group:not(.full)').filter({ hasText: text });
  await expect(fieldWithInput('Bottom Width')).toBeVisible();
  await expect(fieldWithInput('Flow Depth')).toBeVisible();
  await expect(fieldWithInput("Manning's n")).toBeVisible();
  await expect(fieldWithInput('Slope')).toBeVisible();

  // Results table visible with positive values
  await waitForResults(page);
  const q = parseFloat(await getResultValue(page, 'Discharge (Q)'));
  expect(q).toBeGreaterThan(0);
});

// ─── 2. Theme Toggle + localStorage ──────────────────────────────────────

test('2. Theme toggle persists via localStorage', async ({ page }) => {
  await page.goto('/');

  // Initial = light
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // Toggle to dark
  await page.locator('.btn-icon', { hasText: /🌙|☀️/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Check localStorage
  const stored = await page.evaluate(() => localStorage.getItem('manningcalc-theme'));
  expect(stored).toBe('dark');

  // Reload and check persistence
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Toggle back
  await page.locator('.btn-icon', { hasText: /🌙|☀️/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const stored2 = await page.evaluate(() => localStorage.getItem('manningcalc-theme'));
  expect(stored2).toBe('light');
});

// ─── 3. Cross-Section in LEFT panel ──────────────────────────────────────

test('3. Cross-section diagram is in left panel below shape selector', async ({ page }) => {
  await page.goto('/');

  // Left panel is first child of main-grid
  const leftPanel = page.locator('.main-grid > div:first-child');
  await expect(leftPanel).toBeVisible();

  // Cross-section should be inside left panel
  const diagram = leftPanel.locator('.diagram-container');
  await expect(diagram).toBeVisible();

  // Shape selector should be above it (check order)
  const shapeSelector = leftPanel.locator('.shape-selector');
  await expect(shapeSelector).toBeVisible();

  // Diagram should come AFTER shape selector in DOM
  const shapeBbox = await shapeSelector.boundingBox();
  const diagramBbox = await diagram.boundingBox();
  expect(shapeBbox).toBeTruthy();
  expect(diagramBbox).toBeTruthy();
  expect(diagramBbox!.y).toBeGreaterThan(shapeBbox!.y);
});

// ─── 4. All 6 Samples ───────────────────────────────────────────────────

const sampleExpected = [
  { name: 'Concrete Rectangular Channel', shape: 'Rectangle', solveFor: 'Q' },
  { name: 'Earth Trapezoidal Canal', shape: 'Trapezoid', solveFor: 'y' },
  { name: 'Grassed Waterway', shape: 'Triangle', solveFor: 'Q' },
  { name: 'Circular Storm Sewer', shape: 'Circle', solveFor: 'Q' },
  { name: 'Steep Mountain Stream', shape: 'Trapezoid', solveFor: 'Q' },
  { name: 'Large River Section', shape: 'Trapezoid', solveFor: 'y' },
];

for (const s of sampleExpected) {
  test(`4. Sample: ${s.name} — shape changes and results update`, async ({ page }) => {
    await page.goto('/');

    // Open dropdown
    await page.locator('button', { hasText: 'Samples' }).click();
    await expect(page.locator('.dropdown-menu')).toBeVisible();

    // Click sample
    await page.locator('.dropdown-item', { hasText: s.name }).click();

    // Dropdown should close
    await expect(page.locator('.dropdown-menu')).not.toBeVisible();

    // Shape should match
    await expect(page.locator('.shape-btn.active')).toContainText(s.shape);

    // Solve-for should match
    const selectVal = await page.locator('select').inputValue();
    expect(selectVal).toBe(s.solveFor);

    // Results visible with positive Q, y, V
    await waitForResults(page);
    expect(parseFloat(await getResultValue(page, 'Discharge (Q)'))).toBeGreaterThan(0);
    expect(parseFloat(await getResultValue(page, 'Normal Depth (y)'))).toBeGreaterThan(0);
    expect(parseFloat(await getResultValue(page, 'Velocity (V)'))).toBeGreaterThan(0);

    // SVG diagram visible
    await expect(page.locator('.diagram-container svg')).toBeVisible();
  });
}

// ─── 5. Shape Switching — fields + SVG ───────────────────────────────────

test('5. Shape switching: correct fields and SVG updates', async ({ page }) => {
  await page.goto('/');

  const fieldWithInput = (text: string) =>
    page.locator('.form-group:not(.full)').filter({ hasText: text });

  // Rectangle
  await expect(page.locator('.shape-btn.active')).toContainText('Rectangle');
  await expect(fieldWithInput('Bottom Width')).toBeVisible();
  await expect(fieldWithInput('Flow Depth')).toBeVisible();
  await expect(fieldWithInput('Side Slope')).not.toBeVisible();
  await expect(fieldWithInput('Diameter')).not.toBeVisible();

  const rectSvg = await page.locator('.diagram-container svg').innerHTML();

  // Trapezoid
  await page.locator('.shape-btn', { hasText: 'Trapezoid' }).click();
  await expect(fieldWithInput('Bottom Width')).toBeVisible();
  await expect(fieldWithInput('Side Slope')).toBeVisible();
  await expect(fieldWithInput('Diameter')).not.toBeVisible();

  const trapSvg = await page.locator('.diagram-container svg').innerHTML();
  expect(trapSvg).not.toBe(rectSvg);

  // Triangle
  await page.locator('.shape-btn', { hasText: 'Triangle' }).click();
  await expect(fieldWithInput('Bottom Width')).not.toBeVisible();
  await expect(fieldWithInput('Side Slope')).toBeVisible();
  await expect(fieldWithInput('Diameter')).not.toBeVisible();

  const triSvg = await page.locator('.diagram-container svg').innerHTML();
  expect(triSvg).not.toBe(trapSvg);

  // Circle
  await page.locator('.shape-btn', { hasText: 'Circle' }).click();
  await expect(fieldWithInput('Diameter')).toBeVisible();
  await expect(fieldWithInput('Bottom Width')).not.toBeVisible();
  await expect(fieldWithInput('Side Slope')).not.toBeVisible();

  const circleSvg = await page.locator('.diagram-container svg').innerHTML();
  expect(circleSvg).not.toBe(triSvg);
  // Circle SVG should contain an arc
  expect(circleSvg).toContain('A');
});

// ─── 6. Report ───────────────────────────────────────────────────────────

test('6. Report opens new tab with formatted report', async ({ page }) => {
  await page.goto('/');
  await waitForResults(page);

  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.locator('button', { hasText: 'Report' }).click(),
  ]);
  await newPage.waitForLoadState();

  // Title
  await expect(newPage.locator('h1')).toContainText('manningcalc Report');

  // Input parameters section
  await expect(newPage.locator('text=Input Parameters')).toBeVisible();
  await expect(newPage.locator('.inputs-grid')).toBeVisible();

  // Cross Section diagram
  await expect(newPage.locator('.diagram svg')).toBeVisible();

  // Manning's equation heading shown
  await expect(newPage.locator('h2', { hasText: "Manning's Equation" })).toBeVisible();

  // Results table
  await expect(newPage.locator('table')).toBeVisible();

  // Print hint
  await expect(newPage.locator('.hint')).toContainText('Ctrl+P');

  // Flow regime badge
  await expect(newPage.locator('.badge')).toBeVisible();

  await newPage.close();
});

// ─── 7. In-Place Exports ─────────────────────────────────────────────────

test('7a. CSV export button exists on results', async ({ page }) => {
  await page.goto('/');
  await waitForResults(page);

  const csvBtn = page.locator('button', { hasText: 'CSV' });
  await expect(csvBtn).toBeVisible();

  // Click CSV - should trigger download (verify no crash)
  const downloadPromise = page.waitForEvent('download', { timeout: 3000 }).catch(() => null);
  await csvBtn.click();
  const download = await downloadPromise;
  if (download) {
    expect(download.suggestedFilename()).toContain('manningcalc');
    expect(download.suggestedFilename()).toContain('.csv');
  }
  // Either way, page should still work
  await expect(page.locator('h1')).toContainText('manningcalc');
});

test('7b. PNG/SVG export buttons exist on chart', async ({ page }) => {
  await page.goto('/');
  await waitForResults(page);

  const exportBtns = page.locator('.export-buttons');
  await expect(exportBtns).toBeVisible();

  const pngBtn = exportBtns.locator('button', { hasText: 'PNG' });
  const svgBtn = exportBtns.locator('button', { hasText: 'SVG' });
  await expect(pngBtn).toBeVisible();
  await expect(svgBtn).toBeVisible();

  // Click SVG export
  const svgDownload = page.waitForEvent('download', { timeout: 3000 }).catch(() => null);
  await svgBtn.click();
  const dl = await svgDownload;
  if (dl) {
    expect(dl.suggestedFilename()).toContain('.svg');
  }
  await expect(page.locator('h1')).toContainText('manningcalc');
});

// ─── 8. Flow Classification ─────────────────────────────────────────────

test('8. Flow classification correct for different samples', async ({ page }) => {
  await page.goto('/');

  // Subcritical: Concrete Rectangular Channel
  await page.locator('button', { hasText: 'Samples' }).click();
  await page.locator('.dropdown-item', { hasText: 'Concrete Rectangular' }).click();
  await waitForResults(page);

  const badge1 = page.locator('.badge');
  await expect(badge1).toContainText('subcritical');
  const fr1 = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
  expect(fr1).toBeLessThan(1);
  expect(fr1).toBeGreaterThan(0);

  // Supercritical: Steep Mountain Stream
  await page.locator('button', { hasText: 'Samples' }).click();
  await page.locator('.dropdown-item', { hasText: 'Steep Mountain' }).click();
  await waitForResults(page);

  const badge2 = page.locator('.badge');
  await expect(badge2).toContainText('supercritical');
  const fr2 = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
  expect(fr2).toBeGreaterThan(1);

  // Earth Trapezoidal Canal — should be subcritical (gentle slope)
  await page.locator('button', { hasText: 'Samples' }).click();
  await page.locator('.dropdown-item', { hasText: 'Earth Trapezoidal' }).click();
  await waitForResults(page);

  const badge3 = page.locator('.badge');
  await expect(badge3).toContainText('subcritical');
  const fr3 = parseFloat(await getResultValue(page, 'Froude Number (Fr)'));
  expect(fr3).toBeLessThan(1);
});

// ─── 9. Solve-For Dropdown ──────────────────────────────────────────────

test('9. Solve-for dropdown changes target variable', async ({ page }) => {
  await page.goto('/');
  await waitForResults(page);

  const fieldWithInput = (text: string) =>
    page.locator('.form-group:not(.full)').filter({ hasText: text }).locator('input');

  // Default: solve for Q — Q field should be hidden, others visible
  expect(await page.locator('select').inputValue()).toBe('Q');
  await expect(fieldWithInput('Flow Depth')).toBeVisible();
  await expect(fieldWithInput('Bottom Width')).toBeVisible();

  // Switch to solve for y — Flow Depth field hidden, Discharge appears
  await page.locator('select').selectOption('y');
  await expect(fieldWithInput('Flow Depth')).not.toBeVisible();
  await expect(fieldWithInput('Discharge')).toBeVisible();

  // Fill Q so results compute
  await fieldWithInput('Discharge').fill('100');
  await waitForResults(page);
  const y = parseFloat(await getResultValue(page, 'Normal Depth (y)'));
  expect(y).toBeGreaterThan(0);

  // Switch to solve for n
  await page.locator('select').selectOption('n');
  await expect(fieldWithInput("Manning's n")).not.toBeVisible();
  await expect(fieldWithInput('Flow Depth')).toBeVisible();

  // Switch to solve for S
  await page.locator('select').selectOption('S');
  await expect(fieldWithInput('Slope')).not.toBeVisible();

  // Switch to solve for b (only for rectangle/trapezoid)
  await page.locator('select').selectOption('b');
  await expect(fieldWithInput('Bottom Width')).not.toBeVisible();
});

// ─── 10. Guide/Feedback Buttons ─────────────────────────────────────────

test('10. Guide and Feedback buttons exist and have correct targets', async ({ page }) => {
  await page.goto('/');

  // Guide button
  const guideBtn = page.locator('button', { hasText: 'Guide' });
  await expect(guideBtn).toBeVisible();
  // Should open intro.html
  const guideTitle = await guideBtn.getAttribute('title');
  expect(guideTitle).toContain('guide');

  // Feedback button
  const feedbackBtn = page.locator('button', { hasText: 'Feedback' });
  await expect(feedbackBtn).toBeVisible();
  const feedbackTitle = await feedbackBtn.getAttribute('title');
  expect(feedbackTitle).toContain('Feedback');

  // Check guide opens a new page
  const [guidePage] = await Promise.all([
    page.context().waitForEvent('page'),
    guideBtn.click(),
  ]);
  const guideUrl = guidePage.url();
  expect(guideUrl).toContain('intro.html');
  await guidePage.close();
});
