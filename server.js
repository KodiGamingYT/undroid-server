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

// Zabezpieczone odbieranie współrzędnych swipe i kliknięć
app.get('/click', (req, res) => {
    // Jeśli z jakiegoś powodu x1 nie istnieje, traktujemy to jako zwykły klik (x, y)
    let x1 = req.query.x1 || req.query.x || "0";
    let y1 = req.query.y1 || req.query.y || "0";
    let x2 = req.query.x2 || x1;
    let y2 = req.query.y2 || y1;

    pendingClicks.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
    res.send("OK");
});

app.get('/get_clicks', (req, res) => {
    res.json(pendingClicks);
    pendingClicks = [];
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server streaming on port ${PORT}`));
