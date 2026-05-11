const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
mongoose.connect('***REMOVED***')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection Error:', err));

// SCHEMAS
const cardSchema = new mongoose.Schema({ q: String, a: String, c: String, t: String });
const Card = mongoose.model('Card', cardSchema);

const userSchema = new mongoose.Schema({ username: { type: String, unique: true }, password: { type: String } });
const User = mongoose.model('User', userSchema);

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "Registered" });
    } catch (e) { res.status(400).json({ message: "User exists" }); }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne(req.body);
    user ? res.json({ success: true }) : res.status(401).json({ message: "Fail" });
});

// CARD ROUTES
app.get('/api/cards', async (req, res) => res.json(await Card.find()));
app.post('/api/cards', async (req, res) => res.status(201).json(await new Card(req.body).save()));
app.delete('/api/cards/:id', async (req, res) => {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log('🚀 Server on port 3000'));