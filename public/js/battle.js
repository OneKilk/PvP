const socket = io();
const hitSound = document.getElementById('hit-sound');

// Đọc dữ liệu từ script tag ẩn trong EJS
const playerRaw = document.getElementById('player-data-raw').textContent;
const myData = JSON.parse(playerRaw);

// Biến toàn cục quản lý máu
let playerMaxHp = 100;
let enemyMaxHp = 100;

// Bắt đầu tìm trận ngay khi vào trang
socket.emit('startBattle', myData);

// 1. KHI TÌM THẤY ĐỐI THỦ
socket.on('matchFound', (data) => {
    document.getElementById('matchmaking-overlay').style.display = 'none';
    document.getElementById('arena').style.display = 'flex';
    document.getElementById('battle-log').style.display = 'block';

    const me = data.players.find(p => p.id === socket.id);
    const enemy = data.players.find(p => p.id !== socket.id);

    if (me) {
        playerMaxHp = me.maxHp || me.hp;
        document.getElementById('player-avatar-box').innerHTML = me.avatar ? 
            `<img src="${me.avatar}" class="fighter-img">` : `<span>🤠</span>`;
        updateUI('player', me.hp, playerMaxHp);
    }

    if (enemy) {
        enemyMaxHp = enemy.maxHp || enemy.hp;
        document.getElementById('enemy-name-display').innerText = enemy.name;
        document.getElementById('enemy-avatar-box').innerHTML = enemy.avatar ? 
            `<img src="${enemy.avatar}" class="fighter-img">` : `<span>👾</span>`;
        updateUI('enemy', enemy.hp, enemyMaxHp);
    }
});

// 2. CẬP NHẬT TỪNG LƯỢT ĐÁNH
socket.on('battleUpdate', (data) => {
    const me = data.players.find(p => p.id === socket.id);
    const enemy = data.players.find(p => p.id !== socket.id);
    
    if(me) updateUI('player', me.hp, playerMaxHp);
    if(enemy) updateUI('enemy', enemy.hp, enemyMaxHp);

    const isAttackerMe = data.attackerId === socket.id;
    performHit(
        isAttackerMe ? 'player-hero' : 'enemy-hero', 
        isAttackerMe ? 'enemy-hero' : 'player-hero', 
        data.damage
    );

    addLog(data.log);
});

// 3. KẾT THÚC TRẬN ĐẤU
socket.on('gameOver', (res) => {
    document.getElementById('btn-back').style.display = 'block';
    const isWinner = res.winnerId === socket.id;
    const logContainer = document.getElementById('battle-log');
    
    const statusMsg = document.createElement('h2');
    statusMsg.className = 'game-over-title';
    statusMsg.style.color = isWinner ? "#2ecc71" : "#ff4444";
    statusMsg.innerText = isWinner ? '--- CHIẾN THẮNG ---' : '--- BẠN ĐÃ THUA ---';
    
    logContainer.prepend(statusMsg);
});

// --- CÁC HÀM BỔ TRỢ (HELPER FUNCTIONS) ---

function updateUI(who, hp, maxHp) {
    const currentHp = Math.max(0, Math.round(hp));
    const percentage = (currentHp / maxHp) * 100;
    
    const bar = document.getElementById(`${who}-hp-bar`);
    const text = document.getElementById(`${who}-hp-text`);
    
    bar.style.width = percentage + "%";
    text.innerText = `HP: ${currentHp}/${maxHp}`;
    
    // Đổi màu thanh máu theo %
    bar.style.backgroundColor = percentage < 30 ? "#ff4444" : "#2ecc71";
}

function performHit(atkId, defId, dmg) {
    const atkElement = document.getElementById(atkId);
    
    // Âm thanh
    hitSound.currentTime = 0; 
    hitSound.play().catch(()=>{});
    
    // Hiệu ứng giật (Shake)
    const moveX = atkId === 'player-hero' ? 30 : -30;
    atkElement.style.transform = `translateX(${moveX}px)`;
    
    setTimeout(() => {
        atkElement.style.transform = 'translateX(0)';
        showDamagePop(defId === 'player-hero' ? 'player-damage-pos' : 'enemy-damage-pos', dmg);
    }, 100);
}

function showDamagePop(posId, val) {
    const pos = document.getElementById(posId);
    const pop = document.createElement('div');
    pop.className = 'damage-pop';
    pop.innerText = `-${Math.round(val)}`;
    pos.appendChild(pop);
    setTimeout(() => pop.remove(), 600);
}

function addLog(message) {
    const log = document.getElementById('battle-log');
    const p = document.createElement('p');
    p.innerHTML = `> ${message}`;
    log.prepend(p);
}