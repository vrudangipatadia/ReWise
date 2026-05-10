const API_URL = 'http://localhost:3000/api/cards';
let cards = [];
let editingIndex = null;

// // loading cards from database - cRud - READ OPERATION --------------------------------------------------------
const fetchCards = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('database offline');
    cards = await res.json();
    render();
  } catch (err) {
    console.error('fetch error:', err);
    // show user something went wrong
    document.getElementById("grid").innerHTML = `<p style="grid-column: 1/-1; text-align: center;">⚠️ couldn't load cards. check server.</p>`;
  }
};

// Crud - CREATE OPERATION --------------------------------------------------------------------------------------
const addCard = async () => {
  const q = document.getElementById("question").value.trim();
  const a = document.getElementById("answer").value.trim();
  const c = document.getElementById("color").value;
  const t = document.getElementById("tag").value.trim();

  // prevents saving empty cards
  if (!q || !a) {
    alert("Question and Answer are required.");
    return;
  }

  const newCard = { q, a, c, t, show: false };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard)
    });

    if (res.ok) {
      const saved = await res.json();
      cards.push(saved);
      // reset form
      document.getElementById("question").value = "";
      document.getElementById("answer").value = "";
      document.getElementById("tag").value = "";
      render();
    }
  } catch (err) {
    console.error('save failed:', err);
  }
};

const toggle = (index) => {
  const target = cards[index];
  target.show = !target.show;
  render();

  // auto remove card after flipping the card
  if (target.show) {
    setTimeout(() => {
      const currentIdx = cards.indexOf(target);
      if (currentIdx !== -1 && target.show) {
        const el = document.getElementById("grid").children[currentIdx];
        if (el) {
          el.classList.add('fade-out');
          setTimeout(() => {
            const finalIdx = cards.indexOf(target);
            if (finalIdx !== -1) {
              // Note: This splice is local-only as per your auto-remove logic
              cards.splice(finalIdx, 1);
              render();
            }
          }, 400); // wait time until animation of shrik and fade completes before deleting data
        }
      }
    }, 4500); // time for user to reda before fade starts
  }
};

// operations in edit popup
const openEditModal = (e, index) => {
  e.stopPropagation(); 
  editingIndex = index;
  const card = cards[index];
  
  document.getElementById('edit-question').value = card.q;
  document.getElementById('edit-answer').value = card.a;
  document.getElementById('edit-color').value = card.c;
  document.getElementById('edit-tag').value = card.t;
  
  document.getElementById('editModal').classList.add('active');
};

const closeModal = () => {
  document.getElementById('editModal').classList.remove('active');
  editingIndex = null;
};

// crUd - UPDATE OPERATION---------------------------------------------------------------------------------------------------
const saveEdit = async () => {
  if (editingIndex === null) return;
  
  const card = cards[editingIndex];
  const updatedData = {
    q: document.getElementById('edit-question').value,
    a: document.getElementById('edit-answer').value,
    c: document.getElementById('edit-color').value,
    t: document.getElementById('edit-tag').value
  };

  try {
    // UPDATED: Now sends a PUT request to the database
    const res = await fetch(`${API_URL}/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      closeModal();
      fetchCards(); // Refresh list to sync with database
    }
  } catch (err) {
    console.error('update failed:', err);
  }
};

// cruD -DELETE OPERATION -------------------------------------------------------------------------------------------
const deleteCard = async (e, index) => {
  e.stopPropagation(); 
  const card = cards[index];

  try {
    // UPDATED: Now sends a DELETE request to the database
    const res = await fetch(`${API_URL}/${card._id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      fetchCards(); // Refresh list to sync with database
    }
  } catch (err) {
    console.error('delete failed:', err);
  }
};

// map gradients
const getGradients = (color) => {
  const themes = {
    pink: { f: "linear-gradient(135deg,#ec4899,#d946ef)", b: "linear-gradient(135deg,#fce7f3, #f5d0fe)", txt: '#444' },
    orange: { f: "linear-gradient(135deg,#f59e0b,#ef4444)", b: "linear-gradient(135deg,#fef3c7, #fee2e2)", txt: '#111' },
    purple: { f: "linear-gradient(135deg,#8b5cf6,#d946ef)", b: "linear-gradient(135deg,#ede9fe, #f5d0fe)", txt: '#444' },
    emerald: { f: "linear-gradient(135deg,#10b981,#34d399)", b: "linear-gradient(135deg,#d1fae5, #a7f3d0)", txt: '#111' }
  };
  return themes[color] || themes.emerald;
};

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  document.getElementById("count").innerText = `${cards.length} ${cards.length === 1 ? "card" : "cards"}`;

  cards.forEach((card, i) => {
    const theme = getGradients(card.c);

    grid.innerHTML += `
      <div class="card-container" onclick="toggle(${i})">
        <div class="card ${card.show ? 'flipped' : ''}">
          <div class="front" style="background:${theme.f}">
            ${card.t ? `<div class="tag">${card.t}</div>` : ""}
            <div class="card-actions">
              <button class="action-btn" onclick="openEditModal(event, ${i})"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn" onclick="deleteCard(event, ${i})"><i class="fa-solid fa-trash"></i></button>
            </div>
            <small>QUESTION</small>
            <h2>${card.q}</h2>
          </div>
          <div class="back" style="background:${theme.b}; color:${theme.txt}">
            ${card.t ? `<div class="tag" style="background: rgba(0,0,0,0.1); color:${theme.txt}">${card.t}</div>` : ""}
            <div class="card-actions">
              <button class="action-btn" onclick="openEditModal(event, ${i})"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn" onclick="deleteCard(event, ${i})"><i class="fa-solid fa-trash"></i></button>
            </div>
            <small>ANSWER</small>
            <h2>${card.a}</h2>
          </div>
        </div>
      </div>`;
  });
}

fetchCards();
