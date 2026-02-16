const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary'); 

// Import 3 controller đã tách
const page = require('../controllers/pageController');
const player = require('../controllers/playerController');
const uploadCtrl = require('../controllers/uploadController');
const shopController = require('../controllers/shopController');

// Routes hiển thị trang
router.get('/', page.renderIndex);
router.get('/battle', page.renderBattle);
router.get('/leaderboard', page.renderLeaderboard);

// Routes logic nhân vật
router.post('/train', player.handleTrain);
router.post('/update-name', player.handleUpdateName);

// Routes upload (Cloudinary)
router.post('/upload-avatar', upload.single('avatar'), uploadCtrl.handleUploadAvatar);
router.post('/admin/update-bg', upload.single('background'), uploadCtrl.handleUpdateBG);
// Gym AFK
router.post('/toggle-gym', player.toggleGymAFK);
// Upload Pet (Sử dụng middleware upload đã có)
router.post('/upload-pet', upload.single('pet'), uploadCtrl.handleUploadPet);
// Trang shop
router.get('/shop', shopController.renderShop);
// API mua pet
router.post('/shop/buy-pet', shopController.buyPet);

router.get('/pet-profile', (req, res) => {
    // Đảm bảo dữ liệu player có chứa thông tin pet
    res.render('pet-profile', { player: req.session.player }); 
});


module.exports = router;