const Player = require('../models/Player');
const GlobalConfig = require('../models/GlobalConfig');

module.exports = {
    renderIndex: async (req, res) => {
        try {
            const userId = req.sessionID; 
            let player = await Player.findOne({ userId });

            if (!player) {
                player = new Player({
                    name: "Chiến binh " + Math.floor(Math.random() * 9000),
                    userId, hp: 100, atk: 10, spd: 10, avatar: "" 
                });
                await player.save();
            }

            const config = await GlobalConfig.findOne({ configName: 'main' });
            const currentBg = config ? config.backgroundImage : '/images/bg.png';

            req.session.player = player.toObject(); 
            res.render('index', { player, bg: currentBg });
        } catch (err) {
            res.status(500).send("Lỗi kết nối dữ liệu đám mây");
        }
    },

    renderLeaderboard: async (req, res) => {
        try {
            const [topAtk, topHp, topSpd] = await Promise.all([
                Player.find().sort({ atk: -1 }).limit(10),
                Player.find().sort({ hp: -1 }).limit(10),
                Player.find().sort({ spd: -1 }).limit(10)
            ]);
            res.render('leaderboard', { topAtk, topHp, topSpd, player: req.session.player });
        } catch (err) {
            res.status(500).send("Lỗi tải bảng xếp hạng");
        }
    },

    renderBattle: async (req, res) => {
        try {
            const player = await Player.findOne({ userId: req.sessionID });
            if (!player) return res.redirect('/');
            res.render('battle', { player: player.toObject() });
        } catch (err) {
            res.redirect('/');
        }
    }
};