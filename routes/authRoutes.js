const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.render('register', { error: 'Please fill all fields' });
        }
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.render('register', { error: 'Username already exists' });
        }
        const user = new User({ username, password });
        await user.save();
        res.redirect('/');
    } catch (error) {
        res.render('register', { error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/dashboard');
    } catch (error) {
        res.render('login', { error: 'Server error' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/');
});

module.exports = router;
