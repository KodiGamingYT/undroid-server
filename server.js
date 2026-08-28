const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Słowniki przechowujące stan systemu
const vms = {};    // socket.id maszyny -> { name, video_url, user_socket_id }
const users = {};  // socket.id usera -> socket.id połączonej maszyny

// Funkcja rozsyłająca aktualną listę maszyn do wszystkich w "poczekalni"
function broadcastVMList() {
    const list = Object.keys(vms).map(id => ({
        id: id,
        name: vms[id].name,
        is_occupied: vms[id].user_socket_id !== null
    }));
    io.emit('vm_list', list);
}

io.on('connection', (socket) => {
    console.log('Nowe połączenie:', socket.id);
    
    // Wysyłanie listy maszyn od razu po wejściu na stronę
    socket.emit('vm_list', Object.keys(vms).map(id => ({
        id: id, name: vms[id].name, is_occupied: vms[id].user_socket_id !== null
    })));

    // [DLA MASZYN] Rejestracja nowej maszyny (VM)
    socket.on('register_vm', (data) => {
        console.log(`Zarejestrowano maszynę: ${data.name}`);
        vms[socket.id] = {
            name: data.name,
            video_url: data.video_url,
            user_socket_id: null // Na start maszyna jest wolna
        };
        broadcastVMList();
    });

    // [DLA UŻYTKOWNIKA] Próba połączenia z wybraną maszyną
    socket.on('join_vm', (vm_id) => {
        const vm = vms[vm_id];
        if (vm && vm.user_socket_id === null) {
            vm.user_socket_id = socket.id; // Zablokuj maszynę dla innych
            users[socket.id] = vm_id;      // Przypisz usera do maszyny
            
            socket.emit('join_success', { video_url: vm.video_url, name: vm.name });
            broadcastVMList(); // Odśwież menu (maszyna zaświeci się jako zajęta)
            console.log(`User ${socket.id} połączył się z ${vm.name}`);
        } else {
            socket.emit('join_error', 'Ta maszyna jest już zajęta lub rozłączona!');
        }
    });

    // [DLA UŻYTKOWNIKA] Opuszczenie maszyny i powrót do poczekalni
    socket.on('leave_vm', () => {
        const vm_id = users[socket.id];
        if (vm_id && vms[vm_id]) {
            vms[vm_id].user_socket_id = null; // Odblokuj maszynę
        }
        delete users[socket.id];
        broadcastVMList();
    });

    // ROUTING RUCHÓW (Tylko do maszyny, z którą user jest połączony)
    socket.on('mouse_event', (data) => {
        const vm_id = users[socket.id];
        if (vm_id) io.to(vm_id).emit('mouse_event', data);
    });

    socket.on('key_event', (data) => {
        const vm_id = users[socket.id];
        if (vm_id) io.to(vm_id).emit('key_event', data);
    });

    // Odłączenie od serwera (zabezpieczenia)
    socket.on('disconnect', () => {
        // Jeśli rozłączyła się MASZYNA
        if (vms[socket.id]) {
            const user_id = vms[socket.id].user_socket_id;
            if (user_id) {
                // Jeśli ktoś nią sterował, wyrzuć go do menu
                io.to(user_id).emit('vm_disconnected');
                delete users[user_id];
            }
            delete vms[socket.id];
            broadcastVMList();
        }
        // Jeśli rozłączył się UŻYTKOWNIK
        if (users[socket.id]) {
            const vm_id = users[socket.id];
            if (vms[vm_id]) {
                vms[vm_id].user_socket_id = null; // Zwalnia maszynę dla innych
            }
            delete users[socket.id];
            broadcastVMList();
        }
    });
});

server.listen(PORT, () => console.log(`Un-Droid Multi-VM Server działa na porcie ${PORT}`));
