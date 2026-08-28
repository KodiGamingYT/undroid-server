const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', (socket) => {
    console.log('Nawiązano nowe połączenie:', socket.id);

    // Przekazywanie ruchów i kliknięć myszy
    socket.on('mouse_event', (data) => {
        socket.broadcast.emit('mouse_event', data);
    });

    // NOWE: Przekazywanie wciśnięć klawiatury
    socket.on('key_event', (data) => {
        socket.broadcast.emit('key_event', data);
    });

    socket.on('disconnect', () => console.log('Odłączono:', socket.id));
});

server.listen(PORT, () => console.log(`Un-Droid WebSockets Server działa na porcie ${PORT}`));
