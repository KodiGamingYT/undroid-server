const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestFrame = null;
let pendingClicks = [];

app.use(express.raw({ type: 'image/jpeg', limit: '10mb' }));
app.use(express.json());

app.post('/upload_frame', (req, res) => {
    latestFrame = req.body;
    res.send("OK");
});

app.get('/video_feed', (req, res) => {
    if (!latestFrame) { res.status(404).send("No frame available"); return; }
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': latestFrame.length });
    res.end(latestFrame);
});

// Zapisujemy kliknięcie z wirtualnego touchpada wraz z dokładnym czasem
app.get('/click', (req, res) => {
    pendingClicks.push({ 
        x: req.query.x, 
        y: req.query.y,
        timestamp: Date.now()
    });
    res.send("OK");
});

// Przekazujemy do Pythona tylko te kliknięcia, które odczekały 3 sekundy w kolejce
app.get('/get_clicks', (req, res) => {
    const now = Date.now();
    const delay = 3000; // 3000ms = 3 sekundy opóźnienia wideo z Twitcha

    const readyClicks = pendingClicks.filter(c => (now - c.timestamp) >= delay);
    pendingClicks = pendingClicks.filter(c => (now - c.timestamp) < delay);

    res.json(readyClicks);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server synchronized active on port ${PORT}`));
