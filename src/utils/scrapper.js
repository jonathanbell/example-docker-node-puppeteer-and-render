const puppeteer = require('puppeteer');

const scrapeMedium = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
  });
  const page = await browser.newPage();
  await page.goto('https://medium.com/search?q=headless%20browser');

  const scrapedData = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        'div.postArticle-content a:first-child[data-action-value]'
      )
    )
      .filter((node) => node.querySelector('.graf--title'))
      .map((link) => ({
        title: link.querySelector('.graf--title').textContent,
        link: link.getAttribute('data-action-value'),
      }))
  );

  await browser.close();
  return scrapedData;
};

module.exports.scrapeMedium = scrapeMedium;
