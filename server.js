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

// Odbieranie współrzędnych gestu przesunięcia
app.get('/click', (req, res) => {
    pendingClicks.push({ 
        x1: req.query.x1, 
        y1: req.query.y1,
        x2: req.query.x2,
        y2: req.query.y2
    });
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
