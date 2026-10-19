const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const vms = {};    
const users = {};  

function broadcastVMList() {
    const list = Object.keys(vms).map(id => ({
        id: id, name: vms[id].name, os: vms[id].os, is_occupied: vms[id].user_socket_id !== null
    }));
    io.emit('vm_list', list);
}

io.on('connection', (socket) => {
    socket.emit('vm_list', Object.keys(vms).map(id => ({
        id: id, name: vms[id].name, os: vms[id].os, is_occupied: vms[id].user_socket_id !== null
    })));

    socket.on('register_vm', (data) => {
        vms[socket.id] = { name: data.name, video_url: data.video_url, os: data.os, user_socket_id: null };
        broadcastVMList();
    });

    socket.on('join_vm', (vm_id) => {
        const vm = vms[vm_id];
        if (vm && vm.user_socket_id === null) {
            vm.user_socket_id = socket.id; 
            users[socket.id] = vm_id;      
            socket.emit('join_success', { video_url: vm.video_url, name: vm.name, os: vm.os });
            broadcastVMList(); 
        } else {
            socket.emit('join_error', 'Maszyna zajęta!');
        }
    });

    socket.on('leave_vm', () => {
        const vm_id = users[socket.id];
        if (vm_id && vms[vm_id]) vms[vm_id].user_socket_id = null;
        delete users[socket.id];
        broadcastVMList();
    });

    // Routing zdarzeń
    socket.on('mouse_event', (data) => { const vm_id = users[socket.id]; if (vm_id) io.to(vm_id).emit('mouse_event', data); });
    socket.on('key_event', (data) => { const vm_id = users[socket.id]; if (vm_id) io.to(vm_id).emit('key_event', data); });
    socket.on('absolute_input', (data) => { const vm_id = users[socket.id]; if (vm_id) io.to(vm_id).emit('absolute_input', data); });

    socket.on('disconnect', () => {
        if (vms[socket.id]) {
            const user_id = vms[socket.id].user_socket_id;
            if (user_id) { io.to(user_id).emit('vm_disconnected'); delete users[user_id]; }
            delete vms[socket.id]; broadcastVMList();
        }
        if (users[socket.id]) {
            const vm_id = users[socket.id];
            if (vms[vm_id]) vms[vm_id].user_socket_id = null;
            delete users[socket.id]; broadcastVMList();
        }
    });
});

server.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));