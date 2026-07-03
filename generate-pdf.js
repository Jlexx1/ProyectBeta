const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const htmlPath = 'file://' + path.join(__dirname, 'documentacion-interfaces.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(__dirname, 'ALDIA-Interfaces-y-UX.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' }
  });
  await browser.close();
  console.log('PDF generado: ALDIA-Interfaces-y-UX.pdf');
})();
