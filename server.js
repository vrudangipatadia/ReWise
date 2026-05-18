console.log("SERVER FILE LOADED ✔️");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

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
    t: String,
    user: String
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
        const { username, password } = req.body;
        
        // Generate salt and hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username: username,
            password: hashedPassword // Saves the hash, not the password
        });

        await user.save();
        res.status(201).json({ message: 'Registered' });
    } catch (e) {
        res.status(400).json({ message: 'User exists or error occurred' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user) {
            // Compare the plain text password from the user with the hash in the DB
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                return res.json({ success: true, username: user.username });
            }
        }
        
        res.status(401).json({ message: "Fail" });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// `=================` CARD ROUTES =================

// GET ALL (Filtered by User)
app.get('/api/cards', async (req, res) => {
    const { user } = req.query; 
    
    if (!user) {
        return res.json([]); // Return empty if no user is logged in
    }

    // Only finds cards where the 'user' field matches the logged-in username
    const userCards = await Card.find({ user: user }); 
    res.json(userCards);
});

// CREATE
app.post('/api/cards', async (req, res) => {
    const cardData = { ...req.body }; 
    res.status(201).json(await new Card(cardData).save());
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