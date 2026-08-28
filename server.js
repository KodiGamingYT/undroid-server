const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
// Tworzymy serwer HTTP (wymagane przez Socket.IO)
const server = http.createServer(app);
// Inicjalizacja Socket.IO z obsługą CORS
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Serwowanie pliku strony głównej
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Nasłuchiwanie szybkich połączeń Socket.IO
io.on('connection', (socket) => {
    console.log('Nawiązano nowe połączenie:', socket.id);

    // Kiedy przeglądarka wyśle ruch myszy/kliknięcie...
    socket.on('mouse_event', (data) => {
        // ...natychmiast przekaż te dane do WSZYSTKICH innych podłączonych klientów (czyli do Pythona)
        socket.broadcast.emit('mouse_event', data);
    });

    socket.on('disconnect', () => {
        console.log('Klient odłączony:', socket.id);
    });
});

// Używamy server.listen, a nie app.listen!
server.listen(PORT, () => {
    console.log(`Un-Droid WebSockets Server działa na porcie ${PORT}`);
});
