const { test, expect } = require('@playwright/test');

test('Login and add a new borrower', async ({ page }) => {
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

    // 5. Click navigation link to borrowers page
    await page.click('a[href="/borrowers"]'); // Assumes link in Sidebar.jsx or home page
    await expect(page).toHaveURL('http://localhost:3000/borrowers', { timeout: 5000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 }); // Ensure no redirect to login

    // 6. Verify and click "Add Borrower" button
    await page.screenshot({ path: 'borrowers-page-screenshot.png' });
    await expect(page.locator('button:has-text("Add Borrower")')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Add Borrower")');

    // 7. Fill the add borrower form with unique data
    const uniqueId = Date.now();
    await page.fill('input[name="firstname"]', 'John');
    await page.fill('input[name="lastname"]', 'Doe');
    await page.fill('input[name="contactNumber"]', '1234567890');
    await page.fill('input[name="address"]', '123 Main St, City');
    await page.fill('input[name="email"]', `john.doe+${uniqueId}@example.com`);
    await page.fill('input[name="username"]', `johndoe${uniqueId}`);

    // 8. Submit the form
    await page.click('button:has-text("Save")');

    // 9. Confirm success
    await expect(page.locator('text=Added Succesfully!')).toBeVisible({ timeout: 5000 });
    // Verify redirect back to /borrowers (per navigate(-1) in AddBorrower.jsx)
    await expect(page).toHaveURL('http://localhost:3000/borrowers', { timeout: 5000 });
});