const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// flashcard Database 
const flashcardSchema = new mongoose.Schema({
  q: { type: String, required: true },  
  a: { type: String, required: true },  
  c: { type: String, default: 'emerald' }, 
  t: { type: String, default: '' }      
});

const Card = mongoose.model('Card', flashcardSchema);

// default permanent cards
const defaultCards = [
  { q: "What is the national animal of Australia?", a: "Kangaroo", c: "emerald", t: "GK" },
  { q: "What is CSS?", a: "Cascading Style Sheets", c: "pink", t: "Computer" },
  { q: "Who wrote Romeo and Juliet", a: "William Shakespeare", c: "purple", t: "Literature" },
  { q: "What is Node?", a: "Backend JS", c: "orange", t: "Computer" },
];

// connect to mongoDB 
mongoose.connect('***REMOVED***?appName=Cluster0')
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');

    // to modify the deafult cards, this deletes existing memory
    await Card.deleteMany({}); 
    console.log('Database cleared!');

    // brings default cards
    await Card.insertMany(defaultCards);
    console.log('✅ four default cards');

    // cRud - START SERVER ONLY AFTER READ OPERATION IS READY
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// api routes

app.get('/', (req, res) => {
  res.send('Flashcard Backend is running!');
});

// READ OPERATION: get all cards----------------------------------------------
app.get('/api/cards', async (req, res) => {
  try {
    const allCards = await Card.find();
    res.json(allCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE OPERATION: Adding new card--------------------------------------------
app.post('/api/cards', async (req, res) => {
  const newCard = new Card({
    q: req.body.q,
    a: req.body.a,
    c: req.body.c,
    t: req.body.t
  });
  try {
    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE OPERATION: Edit existing card ------------------------------------------
app.put('/api/cards/:id', async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id, 
      {
        q: req.body.q,
        a: req.body.a,
        c: req.body.c,
        t: req.body.t
      },
      { new: true } // returns the modified document rather than the original
    );
    res.json(updatedCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// card delete - DELETE OPERATION --------------------------------------------------
app.delete('/api/cards/:id', async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Card deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});