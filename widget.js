const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = '3000';

app.use(express.static('public')); // Assuming your HTML files and assets are in a 'public' directory.

app.get('/screenshot', async (req, res) => {

    const queryParams = new URLSearchParams(req.query).toString();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:' + '5500' + '/forecast-sticker-develop/sticker.html'+ '?' + queryParams); // Replace with your HTML file name.
    const screenshot = await page.screenshot({ format: 'png' });
    await browser.close();

    res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': screenshot.length });
    res.end(screenshot);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
