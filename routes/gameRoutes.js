const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Khởi tạo nhân vật nếu chưa có
    if (!req.session.player) {
        req.session.player = {
            name: "Chiến binh " + Math.floor(Math.random() * 9000),
            hp: 100,
            atk: 10,
            spd: 10
        };
    }
    res.render('index', { player: req.session.player });
});

router.post('/train', (req, res) => {
    // Kiểm tra bảo vệ: Nếu mất session trong khi đang train thì đẩy về trang chủ
    if (!req.session.player) return res.redirect('/');

    const { stat } = req.body;
    if (stat === 'atk') req.session.player.atk += 2;
    if (stat === 'spd') req.session.player.spd += 2;
    res.redirect('/');
});

router.get('/battle', (req, res) => {
    // FIX LỖI TẠI ĐÂY: Nếu không có dữ liệu nhân vật, không cho vào battle
    if (!req.session.player) {
        return res.redirect('/'); 
    }
    
    // Đảm bảo biến player luôn được truyền đi
    res.render('battle', { player: req.session.player });
});

module.exports = router;