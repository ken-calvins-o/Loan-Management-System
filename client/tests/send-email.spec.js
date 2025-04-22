const { test, expect } = require('@playwright/test');

test('Login and send email to client as a manager', async ({ page }) => {
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

    // 5. Navigate to email client page
    await page.click('a[href="/emailClient"]');
    await expect(page).toHaveURL('http://localhost:3000/emailClient', { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });

    // 6. Verify email form and select a borrower
    await page.screenshot({ path: 'email-page-screenshot.png' });
    await expect(page.locator('text=Send Email')).toBeVisible({ timeout: 10000 }); // From EmailPage.jsx header
    const noBorrowers = await page.locator('text=No Borrower Data').isVisible();
    if (noBorrowers) throw new Error('No borrowers available. Please seed a client in the database.');

    // // Select first borrower (assumes GetBorrowers renders links to /emailClient/:email)
    // await page.locator('a[href^="/emailClient/"]').first().click();
    // await expect(page).toHaveURL(/\/emailClient\/.+@.+/, { timeout: 5000 });

    // 7. Fill the email form
    await expect(page.locator('input[name="fullname"]')).toHaveValue(/.+ .+/, { timeout: 5000 }); // Verify fullname populated
    await expect(page.locator('input[name="email"]')).toHaveValue(/.+@.+/, { timeout: 5000 }); // Verify email populated
    await page.selectOption('select[name="subject"]', 'Loan Approval');
    await page.fill('textarea[name="message"]', 'Your loan has been approved. Please contact us for details.');

    // 8. Submit the form
    await page.waitForSelector('button:has-text("Send message")', { state: 'visible', timeout: 60000 });
    await page.click('button:has-text("Send message")', { timeout: 60000 });

    // 9. Confirm success
    await expect(page.locator('text=Sent Succesfully!')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3000/emailClient', { timeout: 5000 }); // No redirect expected
});