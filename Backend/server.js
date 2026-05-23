console.log("SERVER FILE LOADED ✔️");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors({
    origin: '*', // Connections from Live Server port 5500
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' } // Options: 'user' or 'admin'
});

const User = mongoose.model('User', userSchema);

// AUTH ROUTES 

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

// USER ACCOUNT UPDATES

// 1. ROUTE: UPDATE USERNAME (Cascades to update matching flashcards)
app.put('/api/user/update-username', async (req, res) => {
    try {
        const { currentUsername, newUsername } = req.body;

        if (!currentUsername || !newUsername) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Checks if the username is already in use
        const exists = await User.findOne({ username: newUsername });
        if (exists) {
            return res.status(400).json({ message: "Username already taken." });
        }

        // Update main User profile document
        const updatedUser = await User.findOneAndUpdate(
            { username: currentUsername }, 
            { username: newUsername },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Original user not found." });
        }

        // Cascade change: Update owner handles across all matching flashcards
        await Card.updateMany({ user: currentUsername }, { user: newUsername });

        res.json({ success: true, message: "Username updated successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error renaming account" });
    }
});

// 2. ROUTE: UPDATE PASSWORD (Securely hashes the updated value)
app.put('/api/user/update-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;

        if (!username || !newPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Hash the incoming new plaintext string securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findOneAndUpdate(
            { username: username }, 
            { password: hashedPassword }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ success: true, message: "Password updated successfully" });
    } catch (e) {
        console.error(e); 
        res.status(500).json({ message: "Server error changing password" });
    }
});

// CARD ROUTES 

// GET ALL (Filtered by User)
app.get('/api/cards', async (req, res) => {
    try {
        const { user } = req.query; 
        
        if (!user) {
            return res.json([]); // Return empty if no user is logged in
        }

        // flip the database order (Newest first)
        const userCards = await Card.find({ user: user }).sort({ _id: -1 }); 
        res.json(userCards);
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error sorting cards" });
    }
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