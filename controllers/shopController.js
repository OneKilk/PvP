const Player = require('../models/Player');

// Danh sách Pet "cứng" của hệ thống
const PET_LIBRARY = {
    'slime_xanh': {
        name: 'Slime Xanh',
        avatar: '/images/pets/slime.gif',
        hpBuff: 20, atkBuff: 2, spdBuff: 0
    },
    'rong_lua': {
        name: 'Rồng Lửa',
        avatar: '/images/pets/dragon.gif',
        hpBuff: 0, atkBuff: 15, spdBuff: 5
    },
    'golem_da': {
        name: 'Golem Đá',
        avatar: '/images/pets/golem.gif',
        hpBuff: 100, atkBuff: 0, spdBuff: -5
    }
};

module.exports = {
    renderShop: async (req, res) => {
        // Lấy thông tin player để hiển thị tiền (nếu sau này fen thêm tiền)
        const player = await Player.findOne({ userId: req.sessionID });
        res.render('shop', { player });
    },

    buyPet: async (req, res) => {
        try {
            const { petId } = req.body;
            const selectedPet = PET_LIBRARY[petId];

            if (!selectedPet) {
                return res.status(400).json({ success: false, error: 'Pet không tồn tại' });
            }

            const player = await Player.findOne({ userId: req.sessionID });
            if (!player) return res.status(404).json({ success: false });

            // Gán dữ liệu Pet vào Player
            player.pet = selectedPet;
            
            await player.save();
            
            // Cập nhật session để trang chủ nhận Pet mới ngay lập tức
            req.session.player = player.toObject();

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};