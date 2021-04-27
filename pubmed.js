const puppeteer = require("puppeteer");
const fuzz = require('fuzzball');
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
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
  let articleIdToAuthorList = {};
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
    articleIdToAuthorList[getArticleIds[i]] = hcpNameList;
    page.close();
  }
  // console.log('author names for all article',articleIdToAuthorList); 
  // console.log('author name',authorName); 
  fs.writeFile("pubmed_details_nodejs.json", "[", () => {});

 for (i=0; i< getArticleIds.length ; i++){

  if(!articleIdToAuthorList[getArticleIds[i]].includes('Karen Voigt')) continue;
  console.log('passed id',getArticleIds[i]);
  const authors = articleIdToAuthorList[getArticleIds[i]];
  const fetchDataPage = await browser.newPage();
  await fetchDataPage.goto("https://pubmed.ncbi.nlm.nih.gov"+getArticleIds[i]);
  
  const fetchDetails = await fetchDataPage.evaluate(() => {
  const headingTitle = document.querySelector(".heading-title").innerHTML.trim();

  const affiliationsTags = document.querySelectorAll(".affiliations > ul.item-list >li");
  let affiliations = [];
  for( j =0; j< affiliationsTags.length/2 ; j++){
         affiliations[j] = affiliationsTags[j].innerText;
  }

  const abstractTags = document.querySelectorAll(".abstract-content > p");
  let abstract = '';
  for( j =0; j< abstractTags.length ; j++){
    abstract += abstractTags[j].innerText.trim();
}
  const pubmedId = document.querySelectorAll("span.pubmed > strong[title='PubMed ID']")[0].innerText;

    return {title: headingTitle, affiliations : affiliations, abstract : abstract, pubmedId : pubmedId};
});

  fetchDetails['authors'] = authors;
  
  fs.appendFile(
    "pubmed_details_nodejs.json",
    JSON.stringify(fetchDetails) + ",",
    () => {}
  );

  //console.log('Data is',fetchDetails);
  fetchDataPage.close();

}

  fs.appendFile("pubmed_details_nodejs.json", "]", () => {});
  await browser.close();

})();