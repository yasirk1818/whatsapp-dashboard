const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const Keyword = require('../models/Keyword');
const { deleteClientSession } = require('../services/WhatsappService');
// Is route ko middleware se protect karna zaroori hai (JWT verification)

module.exports = (io) => {
    // Naya device add karein
    router.post('/devices', async (req, res) => {
        // Yahan user ID ko JWT token se nikalna hoga
        const { userId, deviceName } = req.body;
        const clientId = `session-${userId}-${Date.now()}`;

        const newDevice = new Device({ userId, clientId, deviceName });
        await newDevice.save();
        res.status(201).json({ message: 'Device created. Please connect.', device: newDevice });
    });

    // Device delete karein
    router.delete('/devices/:id', async (req, res) => {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).send('Device not found');
        
        await deleteClientSession(device.clientId); // Session delete karein
        await Keyword.deleteMany({ deviceId: device._id }); // Keywords delete karein
        await Device.findByIdAndDelete(req.params.id); // Database se delete karein

        res.status(200).send('Device deleted successfully');
    });
    
    // Baqi CRUD operations (keywords, settings etc.) yahan add karein

    return router;
};
