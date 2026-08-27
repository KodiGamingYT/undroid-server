const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestFrame = null;
let pendingClicks = [];

app.use(express.raw({ type: 'image/jpeg', limit: '10mb' }));
app.use(express.json());

// Odbieranie klatek wideo z Twojego PC
app.post('/upload_frame', (req, res) => {
    latestFrame = req.body;
    res.send("OK");
});

// Strumień klatek przesyłany do Kindle i Paragwaju
app.get('/video_feed', (req, res) => {
    if (!latestFrame) {
        res.status(404).send("No frame available");
        return;
    }
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': latestFrame.length
    });
    res.end(latestFrame);
});

// Zapisywanie kliknięć od użytkowników ze strony
app.get('/click', (req, res) => {
    pendingClicks.push({ x: req.query.x, y: req.query.y });
    res.send("OK");
});

// Oddawanie zgromadzonych kliknięć do Twojego skryptu Pythona
app.get('/get_clicks', (req, res) => {
    res.json(pendingClicks);
    pendingClicks = []; // Czyszczenie kolejki
});

// URUCHOMIENIE STRONY GŁÓWNEJ: Automatycznie ładuje index.html pod czystym adresem URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server streaming on port ${PORT}`));
