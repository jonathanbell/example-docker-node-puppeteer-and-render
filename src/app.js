// https://www.npmjs.com/package/dotenv
require('dotenv').config();

// const scraper = require('./utils/scrapper');
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!!');
});

app.get('/json', (req, res) => {
  res.json({ test: 'this is json bro' });
});

app.get('/foo', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://jonathanbell.ca', {
      waitUntil: 'load',
    });

    const lead_story = await page.$eval('h1', (el) => el.innerText);

    await browser.close();

    return res.send(lead_story);
  } catch (e) {
    return res.send('ERROR: ' + e);
  }
});

app.get('/refresh-stockwatch-token', async (request, response) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const swUsername = process.env.SW_USERNAME;
    const swPassword = process.env.SW_PASSWORD;
    const authorizationBearer = process.env.AUTHORIZATION_BEARER || '';

    const authorizationHeader = request.headers?.authorization ?? '';

    if (authorizationHeader !== 'Bearer ' + authorizationBearer) {
      response.statusCode = 401;
      return response.json({
        errorMessage: 'Invalid Bearer token. Unauthorized.',
      });
    }

    const STOCKWATCH_URL = (path) => `https://www.stockwatch.com${path}`;
    const page = await browser.newPage();

    // https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
    await page.goto(STOCKWATCH_URL(''), { waitUntil: 'domcontentloaded' });

    // Login.
    await page.type('input[id=PowerUserName]', swUsername);
    await page.type('input[id=PowerPassword]', swPassword);
    // Un-check "Remember Me" checkbox.
    await page.$eval(
      'input[id="PowerRememberMe"]',
      (checkbox) => (checkbox.checked = false)
    );

    // Click login button and wait for page navigation.
    await Promise.all([
      page.$eval('input[id=Login]', (loginButton) => loginButton.click()),
      page.waitForNavigation(),
    ]);

    // Navigate to "Excel Web Query" page.
    await page.goto(STOCKWATCH_URL('/Quote/WebQuery'), {
      waitUntil: 'domcontentloaded',
    });

    let data = await page.evaluate((swUsername) => {
      // Use `.evaluate()` to search for our string via XPath.
      let authCode = document.evaluate(
        "//b[contains(., '" + swUsername + "')][1]",
        document,
        null,
        XPathResult.STRING_TYPE,
        null
      ).stringValue;

      // Return an object filled with our data.
      return {
        authCode,
      };
      // https://stackoverflow.com/a/46098448/1171790
    }, swUsername);

    // Logout and wait for page navigation.
    await Promise.all([
      page.$eval('input[id=ImageButton1][alt=Logout]', (logoutButton) =>
        logoutButton.click()
      ),
      page.waitForNavigation(),
    ]);

    // Close the browser.
    await browser.close();

    return response.json({
      authCode: data.authCode,
    });
  } catch (error) {
    response.statusCode = 500;
    return response.json({
      errorMessage:
        'Error encountered while fetching StockWatch auth code: ' + error,
    });
  }
});

app.listen(port, () => {
  console.log(`👂 app is listening for requests on port ${port}`);
});
