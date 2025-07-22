const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Device = require('../models/Device');
const { initializeClient, deleteClientSession } = require('../services/WhatsappService');

router.use(authMiddleware); // Tamam API routes ko protect karein

// Naya device add karein
router.post('/devices', async (req, res) => {
    const { deviceName } = req.body;
    const clientId = `session-${req.user.id}-${Date.now()}`;

    try {
        const device = new Device({
            userId: req.user.id,
            clientId,
            deviceName: deviceName || `Device ${Date.now()}`
        });
        await device.save();
        
        // Client ko initialize karein
        const io = req.app.get('socketio');
        initializeClient(io, clientId);

        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Error creating device' });
    }
});

// User ke devices get karein
router.get('/devices', async (req, res) => {
    const devices = await Device.find({ userId: req.user.id });
    res.json(devices);
});

// Device delete karein
router.delete('/devices/:id', async (req, res) => {
    try {
        const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        
        await deleteClientSession(device.clientId);
        await device.deleteOne();
        
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting device' });
    }
});

// ... baqi keyword aur settings ke routes yahan add karein ...

module.exports = router;
