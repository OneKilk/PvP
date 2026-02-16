const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// --- KẾT NỐI DATABASE ---
const dbURI = 'mongodb+srv://admin:taolachua123@cluster0.ow7werl.mongodb.net/GameDB?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công!'))
    .catch((err) => console.log('❌ Lỗi kết nối MongoDB:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CẤU HÌNH MIDDLEWARE ---
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Cấu hình Session
app.use(session({
    secret: 'game_bi_mat_tudebtrai',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

// --- ROUTES ---
// Sử dụng file routes/index.js (Nơi chứa toàn bộ logic đã tách)
const indexRouter = require('./routes/gameRoutes');
app.use('/', indexRouter);

// --- SOCKET.IO LOGIC ---
const pvpLogic = require('./socket/pvp');
pvpLogic(io);

// --- KHỞI CHẠY SERVER ---
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`
    =============================================
    🚀 Game đang chạy tại: http://localhost:${PORT}
    🛠  Chế độ Admin: http://localhost:${PORT}/?admin=true
    =============================================
    `);
});