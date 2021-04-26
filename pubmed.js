const puppeteer = require("puppeteer");
const fuzz = require('fuzzball');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://pubmed.ncbi.nlm.nih.gov/");

  //await page.waitForTimeout(5000);

  await page.waitForSelector("#id_term");
  await page.type("#id_term", "karen voigt");
  await page.click(".search-btn");

  await page.waitForTimeout(1000);
  // let singleArticle = await page.evaluate(() => {
  //   let el = document.querySelector("#full-view-heading")
  //   return el ? 'single article available' : ""
  // });

  // // if(singleArticle.length >1){
  // //   console.log(singleArticle);
  // //   return
  // // }

  let loadMore = true;
  while (loadMore) {
    let count = 1;
    const selector = '.load-button';
    await page.waitForTimeout(1000);

    if ((await page.$(selector)) !== null  && count<=5) {
      await page.click(selector);
      count++;
    } else {
      loadMore = false;
    }
  }

  const getArticleIds = await page.evaluate(
    () => Array.from(
      document.querySelectorAll("a[class='docsum-title']"),
      a => a.getAttribute('href')
    )
  );

  let authorName = '';
  for (i=0; i< getArticleIds.length ; i++){
    let ratio = -100; 

    const page = await browser.newPage();
    await page.goto("https://pubmed.ncbi.nlm.nih.gov"+getArticleIds[i]);
    await page.waitForSelector(".inline-authors > div.authors > div.authors-list > span > a");
    
     
    const hcpNameList = await page.evaluate(
      () => Array.from(
        document.querySelectorAll(".inline-authors > div.authors > div.authors-list > span > a"),
        a => a.innerHTML
      )
    );
    hcpNameList.forEach(name=>{
      const tempRatio = fuzz.ratio("karen voigt",name);
      if (tempRatio >ratio)
      {
        ratio = tempRatio;
        authorName = name;
      }
    });
   
    page.close();
    break;
  }
   

  console.log('author name is ',authorName);
// console.log('The ids are ',getArticleIds.length);
 console.log('The ratio is ',fuzz.ratio("karen voigt","voigt karen"));


  await browser.close();

})();