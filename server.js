const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

app.use(express.json());

let isVncActive = false;
app.get('/vnc_active', (req, res) => {
    isVncActive = true;
    res.send("OK");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`VNC Web Portal active on port ${PORT}`));
