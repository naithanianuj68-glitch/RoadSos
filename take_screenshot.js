import puppeteer from 'puppeteer';
import fs from 'fs';

async function capture() {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set standard mobile device viewport for PWA view
  await page.setViewport({
    width: 420,
    height: 850,
    deviceScaleFactor: 2,
  });

  console.log("Navigating to http://localhost:5175/ ...");
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  
  // Wait for the app and maps to initialize
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Capturing main dashboard screenshot...");
  await page.screenshot({ path: 'public/app_mockup.png' });
  console.log("Saved dashboard to public/app_mockup.png");

  // Turn Demo Mode ON to ensure all features and maps render mock data
  console.log("Activating Demo Mode...");
  const buttons = await page.$$('header button');
  if (buttons.length > 0) {
    await buttons[0].click(); // First button in header is the Beaker demo button
    await new Promise(r => setTimeout(r, 2000)); // Wait for demo mode coordinates and map to update
  }

  // Open Chatbot
  console.log("Opening AI Chatbot...");
  const chatbotTrigger = await page.$('button.fixed.bottom-6.right-6');
  if (chatbotTrigger) {
    await chatbotTrigger.click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Type emergency query
    console.log("Sending emergency first-aid query...");
    await page.type('input[placeholder="Type your emergency..."]', 'I have severe bleeding');
    const sendBtn = await page.$('button[data-chatbot-send="true"]');
    if (sendBtn) {
      await sendBtn.click();
      await new Promise(r => setTimeout(r, 2500)); // Wait for offline triage response to complete
    }
  }

  console.log("Capturing AI Chatbot screenshot...");
  await page.screenshot({ path: 'public/ai_mockup.png' });
  console.log("Saved AI chatbot screen to public/ai_mockup.png");

  await browser.close();
  console.log("Capture process complete.");
}

capture().catch(err => {
  console.error("Puppeteer capture failed:", err);
  process.exit(1);
});
