let waitingPlayer = null;

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log(`📡 Socket connected: ${socket.id}`);

        socket.on('startBattle', (playerData) => {
            // --- LOGIC CỘNG CHỈ SỐ PET (FIX CHÍNH TẠI ĐÂY) ---
            const finalStats = calculateFinalStats(playerData);
            
            const player = {
                id: socket.id,
                name: finalStats.name,
                hp: finalStats.hp,
                maxHp: finalStats.hp, // Lưu maxHp để hiển thị thanh máu %
                atk: finalStats.atk,
                spd: finalStats.spd, // Thêm tốc độ nếu muốn dùng sau này
                avatar: finalStats.avatar,
                petAvatar: finalStats.petAvatar // Gửi kèm để hiện pet trong trận
            };

            console.log(`🔍 ${player.name} (ATK: ${player.atk}, HP: ${player.hp}) đang tìm trận...`);

            if (waitingPlayer && waitingPlayer.id !== socket.id) {
                const opponentSocket = io.sockets.sockets.get(waitingPlayer.id);
                
                if (opponentSocket) {
                    const opponent = waitingPlayer;
                    waitingPlayer = null; 

                    const roomId = `room_${opponent.id}_${socket.id}`;
                    socket.join(roomId);
                    opponentSocket.join(roomId);

                    console.log(`⚔️ MATCH: ${opponent.name} VS ${player.name}`);

                    // Gửi dữ liệu ĐÃ CỘNG BUFF về cho cả 2 client
                    io.to(roomId).emit('matchFound', {
                        players: [opponent, player]
                    });

                    setTimeout(() => {
                        startCombatLoop(io, roomId, [opponent, player]);
                    }, 2000);
                } else {
                    waitingPlayer = player;
                }
            } else {
                waitingPlayer = player;
            }
        });

        socket.on('disconnect', () => {
            if (waitingPlayer && waitingPlayer.id === socket.id) {
                waitingPlayer = null;
            }
        });
    });
};

/**
 * Hàm tính toán chỉ số cuối cùng dựa trên Pet
 */
function calculateFinalStats(data) {
    // Chỉ số gốc (fallback nếu data rỗng)
    let hp = data?.hp || 100;
    let atk = data?.atk || 10;
    let spd = data?.spd || 10;
    let name = data?.name || "Chiến binh ẩn danh";
    let avatar = data?.avatar || "";
    let petAvatar = "";

    // Nếu có dữ liệu pet được gửi từ client/session
    if (data?.pet) {
        hp += (Number(data.pet.hpBuff) || 0);
        atk += (Number(data.pet.atkBuff) || 0);
        spd += (Number(data.pet.spdBuff) || 0);
        petAvatar = data.pet.avatar || "";
    }

    return { name, hp, atk, spd, avatar, petAvatar };
}

/**
 * Vòng lặp chiến đấu
 */
function startCombatLoop(io, roomId, players) {
    let battleActive = true;
    let turn = 0;

    const interval = setInterval(() => {
        if (!battleActive) return;

        // Xác định ai đánh, ai chịu đòn
        const attackerIdx = turn % 2;
        const defenderIdx = 1 - attackerIdx;
        const attacker = players[attackerIdx];
        const defender = players[defenderIdx];

        // Tính sát thương (có biến thiên 20%)
        const dmg = Math.round(attacker.atk * (0.9 + Math.random() * 0.2));
        defender.hp -= dmg;
        if (defender.hp < 0) defender.hp = 0;

        // Gửi cập nhật trạng thái trận đấu
        io.to(roomId).emit('battleUpdate', {
            attackerId: attacker.id,
            targetId: defender.id,
            damage: dmg,
            // Gửi mảng players mới với HP đã trừ
            players: players.map(p => ({ 
                id: p.id, 
                hp: p.hp, 
                maxHp: p.maxHp 
            })),
            log: `<span class="log-atk">${attacker.name}</span> tung đòn gây <span class="log-dmg">${dmg}</span> sát thương!`
        });

        // Kiểm tra kết thúc
        if (defender.hp <= 0) {
            battleActive = false;
            clearInterval(interval);
            
            io.to(roomId).emit('gameOver', { 
                winnerId: attacker.id,
                log: `🏆 <b>${attacker.name}</b> đã giành chiến thắng vang dội!` 
            });
        }
        
        turn++;
    }, 1500); // Tốc độ đánh: 1.5 giây / lượt
}