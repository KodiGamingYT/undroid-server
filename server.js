const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
// Serwer HTTP potrzebny do podłączenia Socket.IO
const server = http.createServer(app);
// Inicjalizacja WebSockets
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 10000;

app.use(express.json());

// Serwowanie pliku strony głównej
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Nasłuchiwanie połączeń Socket.IO
io.on('connection', (socket) => {
    console.log('Nowe połączenie ustanowione:', socket.id);

    // Kiedy przeglądarka wyśle event 'mouse_event' (ruch myszki / kliknięcie)
    socket.on('mouse_event', (data) => {
        // Przekaż ten sam event NATYCHMIAST do wszystkich innych podłączonych klientów (do Twojego skryptu Python)
        socket.broadcast.emit('mouse_event', data);
    });

    socket.on('disconnect', () => {
        console.log('Klient odłączony:', socket.id);
    });
});

// Zwróć uwagę, że uruchamiamy 'server.listen', a nie 'app.listen'
server.listen(PORT, () => {
    console.log(`Hardware Mouse Server z WebSockets działa na porcie ${PORT}`);
});
