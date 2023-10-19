
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

const TOKEN = '6367193857:AAHQl75wtqo14D7JvAJF6cppdvAUpd05E2I';
const bot = new TelegramBot(TOKEN, { polling: true });

let counter = 0;

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

// Fetch the data from the API
const fetchData = async (lat, lon) => {
    const endpoint = `https://windyapp.co/apiV9.php?lat=${lat}&lon=${lon}&method=getForecastForLatLonTypeNew&type=GFS27`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  };

const takeScreenshot = async (lat, lon) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

      // Capture the console log
      page.on('console', (msg) => {
        console.log('➡️PAGE LOG:', msg.text());
    });

    // Capture the error log
    page.on('error', (err) => {
        console.log('🛑PAGE ERROR:', err);
    }
    );


  const jsonData = await fetchData(lat, lon); // Fetch the JSON data

  //console.log(jsonData);
    // Pass JSON data to the frontend
    await page.evaluate((data) => {
        window.myData = data; // This will make the data accessible as `window.myData` in your frontend scripts
      }, jsonData);

  // Set the viewport to a smaller size
  await page.setViewport({
    width: 500,  // example width
    height: 400, // example height
    deviceScaleFactor: 4 // this will make it "retina" quality (higher resolution)
  });

  await page.goto(`http://localhost:5555/sticker.html?lat=${lat}&lon=${lon}&spotname=thisisliveDemo`);
 
  await delay(1000); 
  // Wait for 1 second

  const screenshot = await page.screenshot();

  //simple counter
  counter++;
  

  console.log("🔥 screenshot taken, lat: " + lat + " lon: " + lon + " counter: " + counter);
  await browser.close();
  return screenshot;
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hiiii Send me your location, and I will give you a detailed forecast 🫱🏽‍🫲🏻.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.location) {
    const { latitude, longitude } = msg.location;

    //bot.sendMessage(chatId, "one moment...");
    try {
      const screenshotBuffer = await takeScreenshot(latitude, longitude);
      bot.sendPhoto(chatId, screenshotBuffer);
    } catch (error) {
      bot.sendMessage(chatId, "Error taking screenshot. Please try again later.");
      console.error("Screenshot error:", error);
    }
  } else {
    bot.sendMessage(chatId, '😪 Send me your location! not this: ' + msg.text);
  }
});


// END OF TELEGRAM BOT

const express = require('express');
const app = express();
const path = require('path');

const PORT = 5555;

app.use(express.static(path.join(__dirname, 'forecast-sticker-develop')));

app.get('/', (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  res.sendFile(path.join(__dirname, 'forecast-sticker-develop', 'sticker.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
