console.log("SERVER FILE LOADED ✔️");
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

// SCHEMA
const cardSchema = new mongoose.Schema({
    q: String,
    a: String,
    c: String,
    t: String
});

const Card = mongoose.model('Card', cardSchema);

// USER SCHEMA
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// ================= AUTH ROUTES =================

app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'Registered' });

    } catch (e) {
        res.status(400).json({ message: 'User exists' });
    }
});

app.post('/api/login', async (req, res) => {

    const user = await User.findOne(req.body);

    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ message: 'Fail' });
    }
});

// `=================` CARD ROUTES =================

// GET ALL
app.get('/api/cards', async (req, res) => {

    const cards = await Card.find();
    res.json(cards);
});

// CREATE
app.post('/api/cards', async (req, res) => {

    const card = new Card(req.body);
    await card.save();

    res.status(201).json(card);
});

// UPDATE
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
            { returnDocument: 'after' }
        );

        res.json(updatedCard);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
});

// DELETE
app.delete('/api/cards/:id', async (req, res) => {

    await Card.findByIdAndDelete(req.params.id);

    res.json({
        message: 'Deleted'
    });
});

// SERVER
app.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});