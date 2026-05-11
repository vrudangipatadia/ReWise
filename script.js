const URL = 'http://localhost:3000/api';

function toggleAuth() {
    const isLoginVisible = document.getElementById('login-form').style.display !== 'none';
    document.getElementById('login-form').style.display = isLoginVisible ? 'none' : 'block';
    document.getElementById('reg-form').style.display = isLoginVisible ? 'block' : 'none';
}

async function login() {
    const username = document.getElementById('l-user').value;
    const password = document.getElementById('l-pass').value;
    
    try {
        const res = await fetch(`${URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            loadCards();
        } else {
            const data = await res.json();
            alert(data.message || "Invalid Credentials");
        }
    } catch (e) {
        alert("Server error. Ensure node server.js is running.");
    }
}

async function register() {
    const username = document.getElementById('r-user').value;
    const password = document.getElementById('r-pass').value;
    
    try {
        const res = await fetch(`${URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
            alert("Success! Now log in.");
            toggleAuth();
        } else {
            const data = await res.json();
            alert(data.message || "Registration failed");
        }
    } catch (e) {
        alert("Server error.");
    }
}

function setView(mode) {
    document.getElementById('view-study').classList.toggle('hidden', mode !== 'study');
    document.getElementById('view-create').classList.toggle('hidden', mode !== 'create');
    document.getElementById('btn-s').classList.toggle('active', mode === 'study');
    document.getElementById('btn-c').classList.toggle('active', mode === 'create');
}

async function loadCards() {
    try {
        const res = await fetch(`${URL}/cards`);
        const cards = await res.json();
        const grid = document.getElementById('card-grid');
        grid.innerHTML = cards.map(c => `
            <div class="card" onclick="this.classList.toggle('flipped')">
                <div class="face front ${c.c}">${c.q}</div>
                <div class="face back">${c.a}</div>
            </div>
        `).join('');
    } catch (e) { console.log("Cards load failed"); }
}

async function addCard() {
    const q = document.getElementById('in-q').value;
    const a = document.getElementById('in-a').value;
    const c = document.getElementById('in-c').value;
    const t = document.getElementById('in-t').value;
    if (!q || !a) return alert("Fill in fields");
    await fetch(`${URL}/cards`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q, a, c, t })
    });
    loadCards();
    document.getElementById('in-q').value = '';
    document.getElementById('in-a').value = '';
}

function openEdit(id, q, a, t) {
    editingId = id;
    document.getElementById('edit-q').value = q;
    document.getElementById('edit-a').value = a;
    document.getElementById('edit-t').value = t;
    document.getElementById('edit-modal').classList.remove('hidden');
}

async function saveEdit() {
    const q = document.getElementById('edit-q').value;
    const a = document.getElementById('edit-a').value;
    const t = document.getElementById('edit-t').value;
    await fetch(`${URL}/cards/${editingId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q, a, t })
    });
    closeModal('edit-modal');
    loadCards();
}

function openDelete(id) {
    deletingId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
}

async function confirmDelete() {
    await fetch(`${URL}/cards/${deletingId}`, { method: 'DELETE' });
    closeModal('delete-modal');
    loadCards();
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }