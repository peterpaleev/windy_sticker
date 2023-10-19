const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const asciiWorldMapFromCoordinates = (lat, lon) => {
    // Define the ASCII world map
    const worldMap = [
        "-----------------------------",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "|                           |",
        "-----------------------------"
    ];

    // Convert latitude and longitude to map coordinates
    const mapWidth = worldMap[0].length;
    const mapHeight = worldMap.length;
    
    const x = Math.floor((lon + 180) * (mapWidth - 2) / 360); // -2 to account for borders
    const y = Math.floor((90 - lat) * (mapHeight - 2) / 180); // -2 to account for borders

    // Create a new map with the marked position
    const newMap = worldMap.map((line, rowIndex) => {
        if (rowIndex === y) {
            return line.substring(0, x) + "X" + line.substring(x + 1);
        }
        return line;
    });

    // Print the map
    newMap.forEach(line => console.log(line));
};

// Test the function with the provided coordinates
asciiWorldMapFromCoordinates(37, 55);

app.use(cors({ origin: 'http://127.0.0.1:5500' }));

app.get('/fetchWindyData', async (req, res) => {
    try {
        const url = new URL('https://windyapp.co/apiV9.php');
        for (const [key, value] of Object.entries(req.query)) {
            url.searchParams.append(key, value);
            console.log(`${key}: ${value}`);
        }
        //if lat lon is provided, print the ascii map
        if (req.query.lat && req.query.lon) {
            asciiWorldMapFromCoordinates(req.query.lat, req.query.lon);
        }

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});