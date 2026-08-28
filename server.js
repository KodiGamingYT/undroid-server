const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestFrame = null;
let pendingClicks = [];

app.use(express.raw({ type: 'image/webp', limit: '10mb' }));
app.use(express.json());

// 1. Odbieranie klatki z Pythona
app.post('/upload_frame', (req, res) => {
    latestFrame = req.body;
    res.send("OK");
});

// 2. Oddawanie najświeższej pojedynczej klatki (Bezpieczne dla każdej przeglądarki)
app.get('/get_frame', (req, res) => {
    if (!latestFrame) {
        res.status(404).send("No frame yet");
        return;
    }
    res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Content-Length': latestFrame.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end(latestFrame);
});

app.get('/click', (req, res) => {
    pendingClicks.push({ x: req.query.x, y: req.query.y });
    res.send("OK");
});

app.get('/get_clicks', (req, res) => {
    res.json(pendingClicks);
    pendingClicks = [];
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server WebP active on port ${PORT}`));
