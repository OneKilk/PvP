const Player = require('../models/Player');

module.exports = {
    /**
     * HUẤN LUYỆN THỦ CÔNG (Bấm phím)
     */
    handleTrain: async (req, res) => {
        const { stat } = req.body;
        try {
            let player = await Player.findOne({ userId: req.sessionID });
            
            if (player && ['atk', 'spd', 'hp'].includes(stat)) {
                let currentVal = player[stat] || 10;
                
                // Công thức tính gain (giảm dần khi chỉ số càng cao để tránh lạm phát)
                let gain = (stat === 'hp') 
                    ? (5 / (1 + (currentVal / 100))) 
                    : (1 / (1 + (currentVal / 20)));
                
                const newValue = parseFloat((currentVal + gain).toFixed(2));
                
                player.set(stat, newValue);
                await player.save();
                
                // Cập nhật session để đồng bộ dữ liệu
                req.session.player = player.toObject();

                // Trả về newValue (số gốc) và các Virtuals (displayAtk, displaySpd) sẽ tự tính ở Client/EJS
                return res.json({ 
                    success: true, 
                    newValue, 
                    gain: gain.toFixed(2),
                    displayAtk: player.displayAtk,
                    displaySpd: player.displaySpd
                });
            }
            res.status(400).json({ error: 'Chỉ số không hợp lệ' });
        } catch (err) {
            console.error("Lỗi Train:", err);
            res.status(500).json({ error: 'Lỗi lưu dữ liệu Atlas' });
        }
    },

    /**
     * CẬP NHẬT TÊN NHÂN VẬT
     */
    handleUpdateName: async (req, res) => {
        try {
            const cleanName = req.body.name.trim().substring(0, 12) || "Vô danh";
            const player = await Player.findOneAndUpdate(
                { userId: req.sessionID }, 
                { name: cleanName }, 
                { returnDocument: 'after' } 
            );
            
            if (player) {
                req.session.player = player.toObject();
                return res.json({ success: true, newName: player.name });
            }
        } catch (err) {
            res.status(400).json({ error: 'Không thể đổi tên' });
        }
    },

    /**
     * BẬT/TẮT CHẾ ĐỘ GYM AFK
     */
    toggleGymAFK: async (req, res) => {
    try {
        const { stat } = req.body;
        let player = await Player.findOne({ userId: req.sessionID });
        if (!player) return res.status(404).json({ success: false });

        if (!player.isTrainingAFK) {
            // BẮT ĐẦU TREO MÁY
            player.isTrainingAFK = true;
            player.lastAFKTime = new Date();
            player.trainingStat = stat;
            await player.save();
        } else {
            // DỪNG TREO MÁY & NHẬN THƯỞNG
            const gain = player.calculateAFKGain();
            const currentStat = player.trainingStat;

            if (gain > 0) {
                player[currentStat] += gain; // Cộng trực tiếp vào chỉ số gốc
            }

            player.isTrainingAFK = false;
            player.lastAFKTime = null;
            player.trainingStat = null;
            
            await player.save();

            // PHẢI CẬP NHẬT SESSION THÌ CHỈ SỐ MỚI HIỆN LÊN
            req.session.player = player.toObject();
            
            return res.json({ 
                success: true, 
                isTraining: false, 
                gain, 
                stat: currentStat,
                newValue: player[currentStat].toFixed(1) 
            });
        }
        
        req.session.player = player.toObject();
        res.json({ success: true, isTraining: player.isTrainingAFK });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};