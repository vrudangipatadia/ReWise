const URL = 'http://localhost:3000/api';
let editingId = null;
let deletingId = null;
let currentUser = null;
let allCards = []; 

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
        
        const data = await res.json();

        if (res.ok) {
            currentUser = data.username; 

            // --- UPDATED: Update UI with User Info ---
            const initialEl = document.getElementById('user-initial');
            const nameEl = document.getElementById('full-username');
            
            if (initialEl) initialEl.innerText = currentUser.charAt(0).toUpperCase();
            if (nameEl) nameEl.innerText = currentUser;

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

// --- NEW: Toggle the Dropdown Menu ---
function toggleLogoutMenu() {
    const menu = document.getElementById('logout-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    
    // Reset UI state
    document.getElementById('l-pass').value = '';
    const menu = document.getElementById('logout-menu');
    if (menu) menu.classList.add('hidden');
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
        const res = await fetch(`${URL}/cards?user=${currentUser}`);
        allCards = await res.json(); // Store the data globally
        renderCards(allCards);       // Display the data
    } catch (e) { console.error(e); }
}

// This function handles all the HTML display logic
function renderCards(cardsToDisplay) {
    // 1. Update Grid View
    const grid = document.getElementById('card-grid');
    grid.innerHTML = cardsToDisplay.map(c => `
        <div class="card card-${c.c}" onclick="this.classList.toggle('flipped')">
            <div class="face front">${c.q}</div>
            <div class="face back"><span>${c.a}</span></div>
        </div>
    `).join('');

    // 2. Update List View
    const list = document.getElementById('card-list');
    list.innerHTML = cardsToDisplay.map(c => `
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
}

async function addCard() {
    const q = document.getElementById('in-q').value;
    const a = document.getElementById('in-a').value;
    const c = document.getElementById('in-c').value;
    const t = document.getElementById('in-t').value;
    
    if (!q || !a) return alert("Fill in fields");

    // 1. Capture the response from the server (it contains the new card with its MongoDB _id)
    const res = await fetch(`${URL}/cards`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q, a, c, t, user: currentUser }) 
    });
    
    const newCard = await res.json(); // Parse the new card data

    // 2. Add the new card directly to the TOP of your local array
    allCards.unshift(newCard);

    // 3. Re-render instantly without making an extra network request
    renderCards(allCards);
    
    // Clear inputs
    document.getElementById('in-q').value = '';
    document.getElementById('in-a').value = '';
    document.getElementById('in-t').value = '';
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

function filterCards() {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allCards.filter(card => {
        // We use || (OR) so that if it matches the Question OR Answer OR Tag, it shows up
        return card.q.toLowerCase().includes(query) || 
               card.a.toLowerCase().includes(query) || 
               (card.t && card.t.toLowerCase().includes(query)); // Check if tag exists first
    });

    renderCards(filtered);
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }