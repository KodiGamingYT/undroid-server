const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Serwer po prostu odsyła plik strony głównej index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serwer po prostu odsyła plik logiki script.js
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.listen(PORT, () => console.log(`VNC Web Portal active on port ${PORT}`));
