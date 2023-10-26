
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

const TOKEN = '6367193857:AAHQl75wtqo14D7JvAJF6cppdvAUpd05E2I';
const bot = new TelegramBot(TOKEN, { polling: true });

const sessions = {};

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

const takeScreenshot = async (lat, lon, hours = false) => {
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
    width: 520,  // example width
    height: 334, // example height
    deviceScaleFactor: 4 // this will make it "retina" quality (higher resolution)
  });

  await page.goto(`http://localhost:5555/sticker.html?lat=${lat}&lon=${lon}&spotname=thisisliveDemo&hours=${hours}`);
 
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
    const { hours } = sessions[chatId];

    //save the location in the session
    sessions[chatId] = { latitude, longitude, hours };

    //bot.sendMessage(chatId, "one moment...");
    try {
      const screenshotBuffer = await takeScreenshot(latitude, longitude, hours);
      bot.sendPhoto(chatId, screenshotBuffer);

      // Ask the user if they want to try again and send text yes, when pressing the button
      bot.sendMessage(chatId, "👍🏽 Done! Wanna try again?", {
        reply_markup: {
          keyboard: [
            [{ text: 'YESSS!' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      

    } catch (error) {
      bot.sendMessage(chatId, "Error taking screenshot. Please try again later.");
      console.error("Screenshot error:", error);
    }
  } else {
    bot.sendMessage(chatId, '😪 Send me your location! not this: ' + msg.text);
        // Ask the user for the number of days for the forecast sticker
        bot.sendMessage(chatId, 'For how many days do you want the forecast sticker?', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '12 hours', callback_data: '12' },
                { text: '3 days', callback_data: '72' },
                { text: '5 days', callback_data: '120' },
                { text: '7 days', callback_data: '168' },
              ]
            ]
          }
        });
    
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const hours = query.data;

  // Ask the user for their location
  bot.sendMessage(chatId, 'Please share your location:', {
    reply_markup: {
      keyboard: [
        [{ text: 'Share Location', request_location: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });

  // Save the number of days for the forecast sticker in the user's session
   sessions[chatId] = { hours };
});

bot.on('location', (msg) => {
  const chatId = msg.chat.id;
  const latitude = msg.location.latitude;
  const longitude = msg.location.longitude;

  console.log("📡 Location received:", latitude, longitude);
  //bot.sendMessage(chatId, `Received your location: Latitude: ${latitude}, Longitude: ${longitude}`);
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
