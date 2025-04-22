const { test, expect } = require('@playwright/test');

test('Login and edit a loan as a manager', async ({ page }) => {
    // Enable debugging logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('request', request => console.log('REQUEST:', request.url(), request.headers()));
    page.on('response', response => console.log('RESPONSE:', response.url(), response.status()));

    // 1. Go to login page
    await page.goto('http://localhost:3000/login');

    // 2. Fill login credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 3. Wait for login success and verify redirect to home
    await expect(page.locator('text=Logged in successfully!')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('http://localhost:3000/home', { timeout: 5000 });

    // 4. Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('TOKEN:', token);
    if (!token) throw new Error('Token not stored in localStorage');

    // 5. Navigate to loans page
    await page.click('a[href="/loans"]');
    await expect(page).toHaveURL('http://localhost:3000/loans', { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });

    // 6. Verify loans table and select first loan to edit
    await page.screenshot({ path: 'loans-page-screenshot.png' });
    await expect(page.locator('text=Loan Transactions')).toBeVisible({ timeout: 10000 });
    const noData = await page.locator('text=No Loan Data').isVisible();
    if (noData) throw new Error('No loans available to edit. Please seed a loan in the database.');

    // Click the first "Edit" button (fixed locator)
    await page.locator('a[href^="/editLoan/"]').first().click();
    await expect(page).toHaveURL(/\/editLoan\/\d+/, { timeout: 5000 });

    // 7. Fill the edit loan form
    await page.selectOption('select[name="type"]', 'Business Loan');
    await page.selectOption('select[name="status"]', 'Approved');
    await page.fill('input[name="gross_loan"]', '50000');
    await page.fill('input[name="balance"]', '45000');
    await page.fill('input[name="amort"]', '5000');
    await page.selectOption('select[name="terms"]', '12');
    await page.fill('input[name="date_released"]', '2025-04-01');
    await page.fill('input[name="maturity_date"]', '2026-04-01');

    // 8. Submit the form
    await page.click('button:has-text("Update")');

    // 9. Confirm success
    await expect(page.locator('text=Updated Succesfully!')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/loans', { timeout: 5000 });

});