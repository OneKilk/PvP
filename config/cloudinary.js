const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình thông số từ Dashboard Cloudinary của bạn
cloudinary.config({
    cloud_name: 'ddela3rmh', 
    api_key: '376419245943192',      
    api_secret: 'SRzjKX-2l1J7zV06cxHY7iqraGk'  
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'game_avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 250, height: 250, crop: 'fill' }] // Tự động cắt ảnh vuông
    },
});

const upload = multer({ storage: storage });

module.exports = upload;