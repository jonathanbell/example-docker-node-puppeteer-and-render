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

app.listen(port, () => {
  console.log(`👂 app is listening for requests on port ${port}`);
});
