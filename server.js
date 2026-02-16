const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// --- KẾT NỐI DATABASE ---
// Ưu tiên lấy link từ Environment Variables trên Render, nếu không có mới dùng link dự phòng
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://admin:taolachua123@cluster0.ow7werl.mongodb.net/GameDB?retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công!'))
    .catch((err) => {
        console.log('❌ Lỗi kết nối MongoDB:', err);
        // Không ngắt server để Render không báo lỗi khởi động ngay lập tức
    });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép mọi nguồn kết nối (cần thiết khi chạy trên Render)
        methods: ["GET", "POST"]
    }
});

// --- CẤU HÌNH MIDDLEWARE ---
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Cấu hình Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'game_bi_mat_tudebtrai',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure: false // Để false vì Render dùng HTTP proxy
    } 
}));

// --- ROUTES ---
const indexRouter = require('./routes/gameRoutes');
app.use('/', indexRouter);

// --- SOCKET.IO LOGIC ---
const pvpLogic = require('./socket/pvp');
pvpLogic(io);

// --- KHỞI CHẠY SERVER (CẤU HÌNH CHO RENDER) ---
// Render sẽ cấp cổng ngẫu nhiên qua process.env.PORT, mặc định dùng 10000 nếu không có
const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =============================================
    🚀 Server is LIVE on Render!
    📡 Port: ${PORT}
    =============================================
    `);
});