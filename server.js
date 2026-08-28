const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

let pendingClicks = [];

app.use(express.json());

// Zaawansowane rejestrowanie gestów dla inteligentnego touchpada
app.get('/click', (req, res) => {
    // Pobieramy punkty startu (x1, y1) i końca (x2, y2)
    // Jeśli urządzenie wyśle stary format (x, y), automatycznie ustawiamy start i koniec w tym samym punkcie
    let x1 = req.query.x1 || req.query.x || "0";
    let y1 = req.query.y1 || req.query.y || "0";
    let x2 = req.query.x2 || x1;
    let y2 = req.query.y2 || y1;

    // Wrzucamy do kolejki pełny wektor ruchu
    pendingClicks.push({ 
        x1: x1, 
        y1: y1, 
        x2: x2, 
        y2: y2 
    });
    
    res.send("OK");
});

// Przekazujemy wszystkie zebrane gesty do Twojego komputera (0 opóźnienia)
app.get('/get_clicks', (req, res) => {
    res.json(pendingClicks);
    pendingClicks = []; // Czyszczenie kolejki, aby nie powtarzać ruchów
});

// Serwowanie Twojej nowej strony głównej z playerem Twitcha
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Instant touchpad server active on port ${PORT}`));
