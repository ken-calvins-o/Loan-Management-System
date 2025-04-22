const { test, expect } = require('@playwright/test');

test('Login and add a new loan', async ({ page }) => {
    // Enable logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('request', request => console.log('REQUEST:', request.url()));
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

    // 4. Navigate to loans page for client ID 3
    await page.goto('http://localhost:3000/loans/3');
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
    await expect(page.locator('button:has-text("Add Loan")')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Add Loan")');

    // 5. Fill the add loan form
    await page.fill('input[name="client_id"]', '3');
    await page.selectOption('select[name="type"]', 'Business Loan');
    await page.selectOption('select[name="status"]', 'Approved');
    await page.fill('input[name="gross_loan"]', '50000');
    await page.fill('input[name="balance"]', '20000');
    await page.fill('input[name="amort"]', '1000');
    await page.selectOption('select[name="terms"]', '6');
    await page.fill('input[name="date_released"]', '2025-04-22T10:00');
    await page.fill('input[name="maturity_date"]', '2025-10-22T10:00');

    // 6. Submit the form
    await page.click('button:has-text("Add New Loan")');

    // 7. Confirm success
    await expect(page.locator('text=Added Succesfully!')).toBeVisible();
    await expect(page).toHaveURL(/\/Borrower\/3/, { timeout: 5000 });
});