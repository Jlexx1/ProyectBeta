const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'prototipos');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 900 });

  // 1. Landing - Hero
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT, '01-landing-hero.png'), fullPage: false });
  console.log('1/8 Landing hero');

  // 2. Landing - Precios/Planes
  await page.evaluate(() => { document.querySelector('#precios')?.scrollIntoView(); });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '02-landing-precios.png'), fullPage: false });
  console.log('2/8 Landing precios');

  // 3. Login
  await page.goto(BASE + '/#login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '03-login.png'), fullPage: false });
  console.log('3/8 Login');

  // 4. Registro
  await page.goto(BASE + '/#registro', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '04-registro.png'), fullPage: false });
  console.log('4/8 Registro');

  // 5. FAQ
  await page.evaluate(() => document.querySelector('#preguntas-frecuentes')?.scrollIntoView());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '05-faq.png'), fullPage: false });
  console.log('5/8 FAQ');

  // 6. Dashboard login
  await page.goto(BASE + '/dashboard.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, '06-dashboard-login.png'), fullPage: false });
  console.log('6/8 Dashboard login');

  // 7. Dashboard panel (log in first)
  await page.type('#login-email', 'admin@aldia.com');
  await page.type('#login-password', 'Admin123!');
  await page.click('.login-card .btn');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT, '07-dashboard-panel.png'), fullPage: true });
  console.log('7/8 Dashboard panel');

  // 8. Data viewer
  await page.goto(BASE + '/data.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '08-data-viewer.png'), fullPage: true });
  console.log('8/8 Data viewer');

  await browser.close();
  console.log('Todos los prototipos guardados en: ' + OUT);
})();
