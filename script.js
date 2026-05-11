const URL = 'http://localhost:3000/api';
let editingId = null;
let deletingId = null;

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
        } else { alert("Login failed."); }
    } catch (e) { alert("Server not responding."); }
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
        if (res.ok) { alert("Success! Log in now."); toggleAuth(); }
    } catch (e) { alert("Registration failed."); }
}

function setView(mode) {
    document.getElementById('view-study').classList.toggle('hidden', mode !== 'study');
    document.getElementById('view-create').classList.toggle('hidden', mode !== 'create');
    document.getElementById('btn-s').classList.toggle('active', mode === 'study');
    document.getElementById('btn-c').classList.toggle('active', mode === 'create');
    loadCards();
}

async function loadCards() {
    try {
        const res = await fetch(`${URL}/cards`);
        const cards = await res.json();
        
        const grid = document.getElementById('card-grid');
        grid.innerHTML = cards.map(c => `
            <div class="card" onclick="this.classList.toggle('flipped')">
                <div class="face front card-${c.c}">${c.q}</div>
                <div class="face back">${c.a}</div>
            </div>
        `).join('');

        const list = document.getElementById('card-list');
        list.innerHTML = cards.map(c => `
            <div class="list-row">
                <div class="row-item">Question: ${c.q}</div>
                <div class="row-item">Answer: ${c.a}</div>
                <div class="row-item"><span class="dot dot-${c.c}"></span>${c.t || 'General'}</div>
                <div class="row-item">
                    <i class="fa-regular fa-pen-to-square edit-icon" onclick="openEdit('${c._id}', '${c.q}', '${c.a}', '${c.t}')"></i>
                    <i class="fa-solid fa-trash delete-icon" onclick="openDelete('${c._id}')"></i>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
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