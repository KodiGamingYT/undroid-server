const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestVideoChunk = null;
let videoClients = [];

app.use(express.raw({ type: 'video/h264', limit: '20mb' }));
app.use(express.json());

// Odbieranie zakodowanego wideo H.264 z Twojego PC
app.post('/upload_video', (req, res) => {
    latestVideoChunk = req.body;
    res.send("OK");

    // Rozsyłanie danych wideo do wszystkich podpiętych odtwarzaczy HTML5
    videoClients.forEach(client => {
        client.res.write(latestVideoChunk);
    });
});

// Strumieniowanie wideo bezpośrednio do tagu <video> na stronie
app.get('/video_stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const clientId = Date.now();
    videoClients.push({ id: clientId, res: res });

    req.on('close', () => {
        videoClients = videoClients.filter(client => client.id !== clientId);
    });
});

let pendingClicks = [];
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

app.listen(PORT, () => console.log(`Server MP4 active on port ${PORT}`));
