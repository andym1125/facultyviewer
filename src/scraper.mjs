import puppeteer from 'puppeteer';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function scrapeProfessor(prof) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://facultyinfo.unt.edu/', {waitUntil: 'load'});
  await page.setViewport({width: 1080, height: 1024});
  
  await page.type('#prfl-search-box', prof);
  await page.click('#prfl-search-form div div .fa-search');
  
  await page.waitForSelector('#prfl-header-nav-primary div ul li:nth-child(2) a')
  await page.click('#prfl-header-nav-primary div ul li:nth-child(2) a')

  // await page.waitForNavigation({waitUntil: 'domcontentloaded'});

  const courseContainerSelector = '#previous-scheduled-teaching div div div div div'
  await page.waitForSelector(courseContainerSelector)
  let courses = await page.$$(courseContainerSelector + " div")
  let courseObjs = []
  for (let i = 0; i < courses.length; i++) {
    let course = courses[i]

    const spot = await course.$('a[data-spot]')
    const spotJson = await spot.evaluate(el => el.getAttribute('data-spot'))
    let spotObj = JSON.parse(spotJson)
  
    courseObjs.push({
      department: await page.evaluate(el => el.textContent, await course.$('span.COURSEPRE')),
      number: await page.evaluate(el => el.textContent, await course.$('span.COURSENUM')),
      section: await page.evaluate(el => el.textContent, await course.$('span.SECTION')),
      name: await page.evaluate(el => el.textContent, await course.$('span.TITLE')),
      semester: await page.evaluate(el => el.textContent, await course.$('span.TYT_TERM')),
      year: await page.evaluate(el => el.textContent, await course.$('span.TYY_TERM')),
      eid: spotObj['EID'],
      osr: spotObj['osr'],
      cei: spotObj['cei'],
      ncq: spotObj['ncq'],
      nes: spotObj['nes'],
      rrate: spotObj['rrate'],
    })
  }

  console.log(courseObjs)

  await delay(600000);
  await browser.close();
}

scrapeProfessor('sneed')