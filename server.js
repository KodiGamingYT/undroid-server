const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestFrame = null;
// Lista aktywnych widzów oglądających strumień
let clients = [];

app.use(express.raw({ type: 'image/jpeg', limit: '10mb' }));
app.use(express.json());

// 1. Odbieranie klatki z Pythona i natychmiastowe rozsyłanie jej do wszystkich połączonych osób
app.post('/upload_frame', (req, res) => {
    latestFrame = req.body;
    res.send("OK");

    // Masowe wypychanie klatki do podpiętych przeglądarek
    clients.forEach(client => {
        client.res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${latestFrame.length}\r\n\r\n`);
        client.res.write(latestFrame);
        client.res.write('\r\n');
    });
});

// 2. Stały, otwarty strumień wideo MJPEG (Wysokie FPS, 1 zapytanie = nieskończony film)
app.get('/video_feed', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache'
    });

    const clientId = Date.now();
    clients.push({ id: clientId, res: res });

    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
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

app.listen(PORT, () => console.log(`Server streaming on port ${PORT}`));
