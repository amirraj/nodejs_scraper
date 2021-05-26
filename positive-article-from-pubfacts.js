const puppeteer = require("puppeteer");
var fs = require('fs');
var os = require("os");


(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null,ignoreHTTPSErrors: true, });

      const page = await browser.newPage();

      await page.goto("https://www.pubfacts.com/authors/all/");
      await page.waitForTimeout(2000);
  
      const listOfLinks = await page.evaluate(
        () => Array.from(
          document.querySelectorAll("a"),
           a => a.getAttribute('href')
          )
        );
      var queue = [];
     
      listOfLinks.forEach(item =>{
         let domainSplit = item.split('/');
         if(domainSplit.includes('author') && domainSplit[domainSplit.length -1].includes('+')){
            queue.push(item);            
         }
     })
     for(let i=1; i<=396;i++)
        queue.shift();
     
     while(queue.length >0){
        const page2 = await browser.newPage();
        try{
        var link = queue.shift();
        await page2.goto(link);
        await page2.waitForTimeout(2000);
        
        const text = await page2.$eval('*', el => el.innerText);
    
       fs.writeFile('./pubfacts/file no '+queue.length+'.txt', text, function (err) {
          if(err) {
              console.log(err);
        } 
        else {
          //console.log("Output saved to /matrixtest.js.");
        }
        })
  
      }catch(err){console.error(err);} 
  
    page2.close();
  }
     

  //page.close();

await browser.close();
})();