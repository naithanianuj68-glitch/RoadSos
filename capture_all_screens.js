import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureAll() {
  console.log("Launching browser for screen captures...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set mobile device aspect ratio
  await page.setViewport({
    width: 420,
    height: 850,
    deviceScaleFactor: 2 // High res
  });

  // Inject Geolocation speed simulator (90 km/h) before loading page
  await page.evaluateOnNewDocument(() => {
    const mockGeolocation = {
      watchPosition: (callback) => {
        setTimeout(() => {
          callback({
            coords: {
              latitude: 13.0067,
              longitude: 80.2206,
              speed: 25.0, // 25 m/s = 90 km/h (overspeed!)
              accuracy: 5
            },
            timestamp: Date.now()
          });
        }, 100);
        return 999;
      },
      clearWatch: () => {}
    };
    navigator.geolocation = mockGeolocation;
  });

  console.log("Loading App...");
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  // Turn Demo Mode ON to load map & coordinates
  console.log("Activating Demo Mode...");
  const headers = await page.$$('header button');
  if (headers.length > 0) {
    await headers[0].click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // Create output dir
  const dir = path.join(__dirname, 'temp_screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Capture 1: Dashboard
  console.log("Capturing Dashboard...");
  await page.screenshot({ path: path.join(dir, 'dashboard.png') });

  // Capture 2: Accident Report expanded
  console.log("Opening Accident Report...");
  const reportTrigger = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Accident Report Generator'));
  });
  if (reportTrigger) {
    await reportTrigger.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("Capturing Accident Report...");
  await page.screenshot({ path: path.join(dir, 'accident_report.png') });

  // Close report accordion
  if (reportTrigger) {
    await reportTrigger.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Capture 3: Speed alert active
  console.log("Starting Speed Monitor (Simulated)...");
  const speedTrigger = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent === 'Start');
  });
  if (speedTrigger) {
    await speedTrigger.click();
    await new Promise(r => setTimeout(r, 1500)); // Wait for Geolocation overspeed trigger
  }
  console.log("Capturing Speed Alert...");
  await page.screenshot({ path: path.join(dir, 'speed_alert.png') });

  // Stop speed monitor
  if (speedTrigger) {
    await speedTrigger.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Capture 4: AI Chatbot triage
  console.log("Opening AI Chatbot triage...");
  const botTrigger = await page.$('button.fixed.bottom-6.right-6');
  if (botTrigger) {
    await botTrigger.click();
    await new Promise(r => setTimeout(r, 800));
    await page.type('input[placeholder="Type your emergency..."]', 'I have severe bleeding');
    const sendBtn = await page.$('button[data-chatbot-send="true"]');
    if (sendBtn) {
      await sendBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log("Capturing AI Chatbot...");
  await page.screenshot({ path: path.join(dir, 'chatbot.png') });

  await browser.close();
  console.log("All key screens captured successfully!");
}

captureAll().catch(e => {
  console.error("Failed screen captures:", e);
  process.exit(1);
});
