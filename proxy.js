const express = require('express');
const cors = require('cors');


const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://127.0.0.1:5500' }));

app.get('/fetchWindyData', async (req, res) => {
    try {
        const response = await fetch('https://windyapp.co/apiV9.php?lat=29.5&lon=5&method=getForecastForLatLonTypeNew&type=GFS27');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});