// KIỂM TRA QUYỀN ADMIN
const params = new URLSearchParams(window.location.search);
if (params.get('admin') === 'true') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';
}

// UPLOAD ẢNH NỀN (ADMIN)
async function uploadBackground(input) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('background', input.files[0]);
        const res = await fetch('/admin/update-bg', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) location.reload();
        else alert("Lỗi: " + data.error);
    }
}

// UPLOAD AVATAR
async function uploadAvatar(input) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('avatar', input.files[0]);
        const res = await fetch('/upload-avatar', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) location.reload();
    }
}

// UPLOAD PET
async function uploadPet(input) {
    if (input.files && input.files[0]) {
        const formData = new FormData();
        formData.append('pet', input.files[0]);
        const res = await fetch('/upload-pet', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) location.reload();
    }
}

// LOGIC GYM AFK
async function toggleGym() {
    const stat = document.getElementById('afk-stat')?.value || null;
    const res = await fetch('/toggle-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stat })
    });
    const data = await res.json();
    if (data.success) {
        if (!data.isTraining && data.gain > 0) {
            alert(`Bạn đã tập xong! Nhận được +${data.gain} ${data.stat.toUpperCase()}`);
        }
        location.reload();
    }
}

// LOGIC HUẤN LUYỆN (PHÍM BẤM)
let currentTrainingType = null;
let requiredKey = null;
let trainingTimer = null;

function startTraining(type) {
    currentTrainingType = type;
    const keys = ['W', 'A', 'S', 'D'];
    requiredKey = keys[Math.floor(Math.random() * keys.length)];
    document.getElementById('target-key').innerText = requiredKey;
    document.getElementById('training-overlay').style.display = 'flex';
    let timeLeft = 100;
    clearInterval(trainingTimer);
    trainingTimer = setInterval(() => {
        timeLeft -= 2;
        document.getElementById('timer-bar').style.width = timeLeft + '%';
        if (timeLeft <= 0) resetUI();
    }, 20);
}

window.addEventListener('keydown', async (e) => {
    if (!currentTrainingType) return;
    if (e.key.toUpperCase() === requiredKey) {
        const type = currentTrainingType;
        resetUI();
        document.body.style.filter = 'invert(1)';
        setTimeout(() => document.body.style.filter = 'invert(0)', 50);
        const res = await fetch('/train', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stat: type })
        });
        const data = await res.json();
        if (data.success) document.getElementById(type + '-val').innerText = data.newValue;
    } else {
        resetUI();
    }
});

function resetUI() {
    currentTrainingType = null;
    clearInterval(trainingTimer);
    document.getElementById('training-overlay').style.display = 'none';
}

async function saveName() {
    const name = document.getElementById('player-name').value;
    await fetch('/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    alert("ĐÃ CẬP NHẬT TÊN!");
}