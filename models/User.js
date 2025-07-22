
#### **3. `models/Device.js`**
```javascript
const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: String, required: true, unique: true },
    deviceName: { type: String, default: 'My WhatsApp' },
    status: { type: String, default: 'Disconnected' },
    settings: {
        antiDelete: { type: Boolean, default: false },
        rejectCalls: { type: Boolean, default: false },
        // Yahan doosre features add karein
    }
});

module.exports = mongoose.model('Device', DeviceSchema);
