const URL = 'http://localhost:3000/api';

let editingId = null;
let deletingId = null;
let currentUser = null;
let allCards = []; 

// Swaps between the Login and Register whenbottom link is clicked
function toggleAuth() {
    const isLoginVisible = document.getElementById('login-form').style.display !== 'none';
    document.getElementById('login-form').style.display = isLoginVisible ? 'none' : 'block';
    document.getElementById('reg-form').style.display = isLoginVisible ? 'block' : 'none';
}

// Creating new account
async function register() {
    const username = document.getElementById('r-user').value;
    const password = document.getElementById('r-pass').value;
    try {
        const res = await fetch(`${URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        // If it worked, tell them to log in and flip the screen back to the login inputs
        if (res.ok) { alert("Success! Log in now."); toggleAuth(); }
    } catch (e) { alert("Registration failed."); }
}

// login
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
            // Save username to global variable or use the text input 
            currentUser = data.username || username; 

            // Using user's name and their first letter into the profile circle icon
            const initialEl = document.getElementById('user-initial');
            const nameEl = document.getElementById('full-username');
            
            if (initialEl) initialEl.innerText = currentUser.charAt(0).toUpperCase();
            if (nameEl) nameEl.innerText = currentUser;

            // Hide login screen and reveal the actual dashboard app
            document.getElementById('auth-box').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            
            // Getting specific user's saved flashcards
            loadCards(); 
        } else { alert("Login failed."); }
    } catch (e) { alert("Server not responding."); }
}


// Profile Settings overlay popup (Username/Password changes)
async function openAccountAction(type) {
     console.log("currentUser at action time:", currentUser);
     
    closeModal('account-modal'); // Closing the popup menu  

    // If the app forgots who is logged in, it grts info back from the UI text label
    if (!currentUser) {
        const nameEl = document.getElementById('full-username');
        if (nameEl && nameEl.innerText) {
            currentUser = nameEl.innerText.trim();
        }
    }

    // Stop session if there's no username saved anywhere
    if (!currentUser) {
        return alert("Error: No active user session tracking found.");
    }

    // Change Username
    if (type === 'username') {
        const newName = prompt("Enter your new username:", currentUser);
        if (!newName || newName.trim() === "" || newName.trim() === currentUser) return; // Ignore if blank or identical

        try {
            const res = await fetch(`${URL}/user/update-username`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ currentUsername: currentUser, newUsername: newName.trim() })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("Username updated successfully! Please log in again.");
                logout(); // Force them out to log back in with their new name
            } else { alert(data.message || "Failed to update username."); }
        } catch (e) { alert("Server error updating username."); }

    // Change Password
    } else if (type === 'password') {
        const newPass = prompt("Enter your new password:");
        if (!newPass || newPass.trim() === "") return; // Skip if they left it empty

        try {
            const res = await fetch(`${URL}/user/update-password`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: currentUser, newPassword: newPass })
            });
            
            if (res.ok) { alert("Password updated successfully!"); } 
            else {
                const data = await res.json();
                alert(data.message || "Failed to update password.");
            }
        } catch (e) { alert("Server error updating password."); }
    }
}

// Clears the user session data and back to login screen
function logout() {
    currentUser = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    document.getElementById('l-pass').value = ''; // Clears password field to be safe
}

// Swaps screens between Practice mode and Create mode
function setView(mode) {
    document.getElementById('view-study').classList.toggle('hidden', mode !== 'study');
    document.getElementById('view-create').classList.toggle('hidden', mode !== 'create');
    
    // Style the navigation buttons so the active tab looks highlighted
    document.getElementById('btn-s').classList.toggle('active', mode === 'study');
    document.getElementById('btn-c').classList.toggle('active', mode === 'create');
    
    loadCards(); // Pull fresh card data down
}

// Pulls cards from the backend server matching the current user
async function loadCards() {
    try {
        const res = await fetch(`${URL}/cards?user=${currentUser}`);
        allCards = await res.json(); // Save them to our hidden global list
        renderCards(allCards);       // Send them to the UI to be built as HTML elements
    } catch (e) { console.error(e); }
}

// Turns raw data array into actual interactive cards 
function renderCards(cardsToDisplay) {
    // 1. Build the flipping grid cards for Practice Mode
    const grid = document.getElementById('card-grid');
    grid.innerHTML = cardsToDisplay.map(c => `
        <div class="card card-${c.c}" onclick="this.classList.toggle('flipped')">
            <div class="face front">${c.q}</div>
            <div class="face back"><span>${c.a}</span></div>
        </div>
    `).join('');

    // 2. Build row list for Create Mode (includes edit/delete buttons)
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

// Grabs values from input bars and sends a new card to the database
async function addCard() {
    const q = document.getElementById('in-q').value;
    const a = document.getElementById('in-a').value;
    const c = document.getElementById('in-c').value;
    const t = document.getElementById('in-t').value;
    
    if (!q || !a) return alert("Fill in fields"); // Don't allow empty cards

    const res = await fetch(`${URL}/cards`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q, a, c, t, user: currentUser }) 
    });
    
    const newCard = await res.json(); 

    // New card should appear at the front of list so it shows up instantly
    allCards.unshift(newCard);
    renderCards(allCards);
    
    // Clears input boxes so they're ready for the next flashcard
    document.getElementById('in-q').value = '';
    document.getElementById('in-a').value = '';
    document.getElementById('in-t').value = '';
}

// Edit card popup box opens pre-filled with current card data
function openEdit(id, q, a, t) {
    editingId = id; // Lock in the ID of the card that is being edited
    document.getElementById('edit-q').value = q;
    document.getElementById('edit-a').value = a;
    document.getElementById('edit-t').value = t;
    document.getElementById('edit-modal').classList.remove('hidden'); // Show popup
}

// Saves changes to the database
async function saveEdit() {
    const q = document.getElementById('edit-q').value;
    const a = document.getElementById('edit-a').value;
    const t = document.getElementById('edit-t').value;
    await fetch(`${URL}/cards/${editingId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q, a, t })
    });
    closeModal('edit-modal'); // Hide popup
    loadCards(); // Reload everything to show updates
}

// Opens up the absolute validation warning block before deleting a card
function openDelete(id) {
    deletingId = id; // Lock in the target ID
    document.getElementById('delete-modal').classList.remove('hidden');
}

// Deletes the card permanently from the server after confirmation click
async function confirmDelete() {
    await fetch(`${URL}/cards/${deletingId}`, { method: 'DELETE' });
    closeModal('delete-modal');
    loadCards(); // Reload view
}

// Search filter that checks question text, answer text, or tag text in real time
function filterCards() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allCards.filter(card => {
        return card.q.toLowerCase().includes(query) || 
               card.a.toLowerCase().includes(query) || 
               (card.t && card.t.toLowerCase().includes(query)); // Only check tags if one exists
    });
    renderCards(filtered); // Display the filtered cards
}

// Function to close modal popups by re-applying the hidden class
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }