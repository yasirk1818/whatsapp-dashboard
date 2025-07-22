
#### **2. `server.js` (Project ke root folder mein)**
```javascript
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const { initializeExistingClients } = require('./services/WhatsappService');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        // Server start hone par purane sessions ko initialize karein
        initializeExistingClients(io);
    })
    .catch(err => console.log(err));

// Global variable for io
app.set('socketio', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));

// View Routes
const authMiddleware = require('./middleware/authMiddleware');
app.get('/', (req, res) => res.render('login', { error: null }));
app.get('/register', (req, res) => res.render('register', { error: null }));
app.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard', { user: req.user });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
