const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let latestFrame = null;
let clients = [];

app.use(express.raw({ type: 'image/webp', limit: '10mb' }));
app.use(express.json());

app.post('/upload_frame', (req, res) => {
    latestFrame = req.body;
    res.send("OK");

    // Rozsyłanie klatek WebP do widzów
    clients.forEach(client => {
        client.res.write(`--frame\r\nContent-Type: image/webp\r\nContent-Length: ${latestFrame.length}\r\n\r\n`);
        client.res.write(latestFrame);
        client.res.write('\r\n');
    });
});

app.get('/video_feed', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
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

app.listen(PORT, () => console.log(`Server WebP active on port ${PORT}`));
