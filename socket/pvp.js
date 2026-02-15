let queue = null;

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-match', (playerData) => {
            if (!queue) {
                queue = { socket, data: playerData };
                socket.emit('waiting', 'Đang tìm đối thủ...');
            } else {
                const opponent = queue;
                queue = null;
                const room = `room_${socket.id}`;

                socket.join(room);
                opponent.socket.join(room);

                let p1 = { ...opponent.data, sId: opponent.socket.id, hp: 100 };
                let p2 = { ...playerData, sId: socket.id, hp: 100 };

                io.to(room).emit('match-start', { p1, p2 });

                // Xác định người đánh đầu tiên dựa trên SPD
                let turnId = (p1.spd >= p2.spd) ? p1.sId : p2.sId;

                const battleInterval = setInterval(() => {
                    let attacker = (turnId === p1.sId) ? p1 : p2;
                    let victim = (turnId === p1.sId) ? p2 : p1;

                    const damage = Math.max(5, attacker.atk + Math.floor(Math.random() * 5));
                    victim.hp -= damage;

                    // Gửi cập nhật máu
                    io.to(room).emit('receive-attack', {
                        attackerId: attacker.sId,
                        p1SId: p1.sId,
                        damage: damage,
                        p1HP: Math.max(0, p1.hp),
                        p2HP: Math.max(0, p2.hp)
                    });

                    // Kiểm tra xem có ai hết máu chưa trước khi đổi lượt
                    if (p1.hp <= 0 || p2.hp <= 0) {
                        const winner = p1.hp > 0 ? p1.name : p2.name;
                        
                        // Gửi thông báo người chiến thắng
                        io.to(room).emit('battle-end', { winner });
                        
                        // Dừng vòng lặp ngay lập tức
                        return clearInterval(battleInterval);
                    }

                    // Nếu chưa ai chết thì mới ĐỔI LƯỢT
                    turnId = victim.sId;

                }, 1500);
            }
        });
    });
};