const puppeteer = require("puppeteer");
var fs = require('fs');
var os = require("os");


(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null,ignoreHTTPSErrors: true, });
  const page = await browser.newPage();
  //await page.goto("https://www.pubpharm.de/vufind/Search/Results?lookfor=Karen&limit=10&type=AllFields");
  //await page.goto("https://sciencedirect.com/search?authors=Karen");
  await page.goto("https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Karen+C+Johnson&btnG=");
  
  await page.waitForTimeout(5000);
  const hcpArticleList = await page.evaluate(
    () => Array.from(
      document.querySelectorAll("a"),
      a => ({link : a.href, title : a.innerText.trim().replace(/\s\s+/g, ' ')})
    )
  );
  
  let filteredList = hcpArticleList.filter(item =>{
        var wordsInTitle = item.title.split(' ');
        console.log('words ',wordsInTitle);
        return wordsInTitle.length >= 4;
  })

  filteredList.forEach(item =>{
    fs.appendFile('articles.txt', 'Link: '+item.link+' Title: '+item.title+ os.EOL, function (err) {
        if(err) {
            console.log(err);
      } 
      else {
        //console.log("Output saved to /matrixtest.js.");
      }
      })
  })

  await browser.close();

})();