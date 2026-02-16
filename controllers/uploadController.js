const Player = require('../models/Player');
const GlobalConfig = require('../models/GlobalConfig');

module.exports = {
    handleUploadAvatar: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ success: false, error: 'Không nhận được file từ Cloudinary' });

            const userId = req.sessionID;
            const imageUrl = req.file.path; // Link https://res.cloudinary.com/...

            const player = await Player.findOneAndUpdate(
                { userId: userId },
                { avatar: imageUrl },
                { returnDocument: 'after' } // Fix cảnh báo Mongoose
            );

            if (player) {
                // CẬP NHẬT LẠI SESSION NGAY LẬP TỨC
                req.session.player = player.toObject();
                console.log("✅ Đã cập nhật Avatar cho:", player.name);
                return res.json({ success: true, url: imageUrl });
            } else {
                return res.status(404).json({ success: false, error: 'Không tìm thấy người chơi' });
            }
        } catch (err) {
            console.error("Lỗi Upload Avatar:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    handleUpdateBG: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ success: false, error: "Thiếu file" });
            const imageUrl = req.file.path;
            await GlobalConfig.findOneAndUpdate(
                { configName: 'main' },
                { backgroundImage: imageUrl },
                { upsert: true, returnDocument: 'after' }
            );
            res.json({ success: true, url: imageUrl });
        } catch (err) {
            res.status(500).json({ success: false, error: "Lỗi lưu nền" });
        }
    },

    handleUploadPet: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ success: false, error: "Chưa chọn ảnh Pet" });
            
            const imageUrl = req.file.path;
            const player = await Player.findOneAndUpdate(
                { userId: req.sessionID },
                { petAvatar: imageUrl },
                { returnDocument: 'after' }
            );

            if (player) {
                req.session.player = player.toObject();
                return res.json({ success: true, url: imageUrl });
            }
        } catch (err) {
            res.status(500).json({ success: false, error: "Lỗi upload Pet" });
        }
    }
};