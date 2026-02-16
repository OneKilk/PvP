const mongoose = require('mongoose');

const globalConfigSchema = new mongoose.Schema({
    configName: { type: String, default: 'main' },
    backgroundImage: { type: String, default: '/images/bg.png' } // Mặc định ban đầu
});

module.exports = mongoose.model('GlobalConfig', globalConfigSchema);