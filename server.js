const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cấu hình Session
app.use(session({
    secret: 'game_bi_mat',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Sử dụng Routes
const gameRoutes = require('./routes/gameRoutes');
app.use('/', gameRoutes);

// Socket Logic (Xử lý PvP online)
const pvpLogic = require('./socket/pvp');
pvpLogic(io);

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Game chạy tại http://localhost:${PORT}`));