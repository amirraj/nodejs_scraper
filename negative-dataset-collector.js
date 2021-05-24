const puppeteer = require("puppeteer");
var fs = require('fs');
var os = require("os");


(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null,ignoreHTTPSErrors: true, });
  var links = new Set();
  var queue = [];
  queue.push("https://www.reddit.com/");

  while(links.size <=10){
      const page = await browser.newPage();
      var link = queue.shift();
      await page.goto(link);
      await page.waitForTimeout(5000);
      links.add(link);

      const text = await page.$eval('*', el => el.innerText);
  
      const listOfLinks = await page.evaluate(
        () => Array.from(
          document.querySelectorAll("a"),
           a => a.getAttribute('href')
          )
        );
  
     listOfLinks.forEach(item =>{
         if(!links.has(item)){
             queue.push(item);
         }
     })
     link = link.replace('/',' ');
     link = link.replace(/\\/,' ');
     fs.appendFile('negative.txt', text, function (err) {
        if(err) {
            console.log(err);
      } 
      else {
        //console.log("Output saved to /matrixtest.js.");
      }
      })

  
}
await browser.close();
})();