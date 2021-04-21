const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://pubmed.ncbi.nlm.nih.gov/");

  //await page.waitForTimeout(5000);
  await page.waitForSelector("#account_login");
  //await page.waitForSelector("#set-base-url usa-button header-button");
  //await page.type(".term-input tt-input","just checkig");
  await page.click("#account_login");
  

  //await browser.close();
})();