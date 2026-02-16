const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: String,
    userId: String,
    hp: { type: Number, default: 100 },
    atk: { type: Number, default: 10 },
    spd: { type: Number, default: 10 },
    avatar: { type: String, default: "" },
    
    // --- GYM AFK ---
    isTrainingAFK: { type: Boolean, default: false },
    lastAFKTime: { type: Date, default: null },
    trainingStat: { type: String, default: null },

    // --- HỆ THỐNG PET MỚI ---
    // Pet bây giờ là một Object chứa thông số riêng của nó
    pet: {
        name: { type: String, default: null },
        avatar: { type: String, default: null },
        atkBuff: { type: Number, default: 0 }, // Chỉ số cộng thêm
        spdBuff: { type: Number, default: 0 },
        hpBuff: { type: Number, default: 0 }
    }
}, { 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// --- VIRTUALS: TÍNH TỔNG CHỈ SỐ (Chỉ số gốc + Chỉ số Pet) ---

playerSchema.virtual('displayAtk').get(function() {
    const petBonus = this.pet && this.pet.atkBuff ? this.pet.atkBuff : 0;
    return (this.atk + petBonus).toFixed(1);
});

playerSchema.virtual('displaySpd').get(function() {
    const petBonus = this.pet && this.pet.spdBuff ? this.pet.spdBuff : 0;
    return (this.spd + petBonus).toFixed(1);
});

playerSchema.virtual('displayHp').get(function() {
    const petBonus = this.pet && this.pet.hpBuff ? this.pet.hpBuff : 0;
    return (this.hp + petBonus).toFixed(1);
});

// --- LOGIC AFK GIỮ NGUYÊN ---
playerSchema.methods.calculateAFKGain = function() {
    if (!this.lastAFKTime || !this.isTrainingAFK) return 0;
    const now = new Date().getTime();
    const startTime = new Date(this.lastAFKTime).getTime();
    const diffMins = Math.floor((now - startTime) / 60000); 
    return diffMins > 0 ? parseFloat((diffMins * 0.1).toFixed(2)) : 0;
};

module.exports = mongoose.model('Player', playerSchema);