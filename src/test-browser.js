const puppeteer = require('puppeteer');

async function run() {
  console.log("Launching puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log("Navigating to http://localhost:3000/ ...");
  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 10000 });

  console.log("Waiting 3 seconds...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  const html = await page.content();
  console.log("HTML length:", html.length);
  if (html.includes("animate-spin")) {
    console.log("Page is still in loading state (spinner found).");
  } else {
    console.log("Spinner not found in HTML.");
  }

  await browser.close();
}

run().catch(console.error);
