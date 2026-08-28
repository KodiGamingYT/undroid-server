const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let mouseEvents = [];

app.use(express.json());

// Rejestrowanie sprzętowych ruchów myszy i przycisków z wirtualnego touchpada Pointer Lock
app.get('/mouse_event', (req, res) => {
    mouseEvents.push({
        action: req.query.action,
        dx: parseInt(req.query.dx || 0),
        dy: parseInt(req.query.dy || 0),
        button: parseInt(req.query.button || 0)
    });
    res.send("OK");
});

app.get('/get_clicks', (req, res) => {
    res.json(mouseEvents);
    mouseEvents = []; // Czyszczenie kolejki, aby ruchy się nie dublowały
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Hardware Mouse Server active on port ${PORT}`));
