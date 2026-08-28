const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let pendingClicks = [];

app.use(express.json());

// Rejestrowanie błyskawicznego kliknięcia z wirtualnego touchpada
app.get('/click', (req, res) => {
    pendingClicks.push({ x: req.query.x, y: req.query.y });
    res.send("OK");
});

// Oddawanie współrzędnych do Pythona w ułamku sekundy
app.get('/get_clicks', (req, res) => {
    res.json(pendingClicks);
    pendingClicks = [];
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Instant touchpad server active on port ${PORT}`));
