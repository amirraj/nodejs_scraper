const puppeteer = require("puppeteer");
var fs = require('fs');
var os = require("os");


(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null,ignoreHTTPSErrors: true, });
  var links = new Set();
  var queue = [];
  // queue.push("https://www.twitter.com/");
  // queue.push("https://www.reddit.com/");
  // queue.push("https://www.youtube.com/");
  // queue.push("https://www.quora.com/");
  // queue.push("https://www.stackoverflow.com/");
  queue.push("https://en.wikipedia.org/wiki/Main_Page");

  while(links.size <=1000){
      const page = await browser.newPage();
      try{
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
     fs.writeFile('./crawled/file no '+links.size+'(2).txt', text, function (err) {
        if(err) {
            console.log(err);
      } 
      else {
        //console.log("Output saved to /matrixtest.js.");
      }
      })

    }catch(err){console.error(err);} 

  page.close();
}
await browser.close();
})();