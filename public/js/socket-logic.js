const socket = io();

// Khi vào trang battle, gửi thông tin nhân vật lên để tìm trận
function findMatch(playerData) {
    socket.emit('join-match', playerData);
}

socket.on('match-start', (data) => {
    console.log("Đã tìm thấy đối thủ:", data.opponent);
    // Cập nhật giao diện đối thủ lên màn hình battle.ejs
});

socket.on('set-turn', (turnId) => {
    if (socket.id === turnId) {
        alert("Đến lượt bạn! Hãy tấn công.");
    } else {
        console.log("Đang đợi đối thủ ra chiêu...");
    }
});