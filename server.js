const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let mouseEvents = [];

app.use(express.json());

// Odbieranie sprzętowych akcji myszy z wirtualnego touchpada Pointer Lock
app.get('/mouse_event', (req, res) => {
    mouseEvents.push({
        action: req.query.action,
        dx: parseInt(req.query.dx || 0),
        dy: parseInt(req.query.dy || 0),
        button: parseInt(req.query.button || 0)
    });
    res.send("OK");
});

// Oddawanie zgromadzonych ruchów do skryptu w Pythonie
app.get('/get_clicks', (req, res) => {
    res.json(mouseEvents);
    mouseEvents = []; // Błyskawiczne czyszczenie kolejki, aby uniknąć lagów
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Hardware Mouse Server active on port ${PORT}`));
