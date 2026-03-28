const { Server } = require('socket.io');

const io = new Server(8002, {
    cors: true,
});
console.log("Socket.IO server running on port 8002");

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('joinRoom', (data) => {
        const { email, room } = data;
        //  console.log(`${email} joined room ${room}`);
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(room).emit("userJoin", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("joinRoom", data);
    });

    socket.on("callUser", ({ to, offer }) => {
        io.to(to).emit("incommingCall", { from: socket.id, offer });
    });

    socket.on("callAccepted", ({ to, answer }) => {
        io.to(to).emit("callAccepted", { from: socket.id, answer });
    });

    socket.on("peer-negotiation-needed", ({ to, offer }) => {
        io.to(to).emit("peer-negotiation-needed", { from: socket.id, offer });
    })

    socket.on("peer-negotiation-done", ({ to, answer }) => {
        io.to(to).emit("peer-negotiation-final", { from: socket.id, answer });
    })

    socket.on("endCall", ({ to }) => {
        io.to(to).emit("endCall", { from: socket.id });
    })
});