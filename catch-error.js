import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  } catch (err) {
    console.log('Navigation error or timeout:', err.message);
  }

  // Wait an extra 5 seconds to catch delayed errors
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
  console.log('Done.');
})();
