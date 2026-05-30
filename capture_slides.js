import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileUrl = 'file://' + path.resolve(__dirname, 'presentation.html');

async function captureSlides() {
  console.log("Launching headless browser to render slides...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set widescreen 16:9 viewport
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2 // High-definition retina screenshots
  });

  console.log(`Loading URL: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000)); // Let initial page load animations finish

  // Ensure directories exist
  const outputDir = path.join(__dirname, 'temp_slides');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const slideCount = 7;
  for (let i = 0; i < slideCount; i++) {
    console.log(`Navigating to Slide ${i + 1}...`);
    // Run goToSlide JavaScript function inside the slide presentation page
    await page.evaluate((idx) => {
      window.goToSlide(idx);
    }, i);

    // Wait for the slide fade-in translation animations to complete
    await new Promise(r => setTimeout(r, 800));

    const outputPath = path.join(outputDir, `slide_${i}.png`);
    await page.screenshot({ path: outputPath });
    console.log(`Captured Slide ${i + 1} and saved to ${outputPath}`);
  }

  await browser.close();
  console.log("All slides successfully captured!");
}

captureSlides().catch(err => {
  console.error("Failed to capture slides:", err);
  process.exit(1);
});
