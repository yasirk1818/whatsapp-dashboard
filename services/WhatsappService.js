// Multi-device ke liye LocalAuth istemal kar rahe hain
const client = new Client({
    authStrategy: new LocalAuth({ clientId: clientId }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    console.log(`QR received for ${clientId}`);
    const qrCodeImage = await qrcode.toDataURL(qr);
    socket.emit('qr_code', { clientId: clientId, qrCode: qrCodeImage });
});

client.on('ready', async () => {
    console.log(`Client is ready: ${clientId}`);
    await Device.findOneAndUpdate({ clientId }, { status: 'Connected' });
    socket.emit('status_update', { clientId: clientId, status: 'Connected', message: 'Device connected successfully!' });
});

client.on('disconnected', async (reason) => {
    console.log(`Client was logged out: ${clientId}`, reason);
    await Device.findOneAndUpdate({ clientId }, { status: 'Disconnected' });
    socket.emit('status_update', { clientId: clientId, status: 'Disconnected', message: 'Device disconnected.' });
    delete clients[clientId];
});

// Features Logic
client.on('message', async (message) => {
    const device = await Device.findOne({ clientId });
    if (!device) return;

    // Keyword Auto-Reply
    const keywords = await Keyword.find({ deviceId: device._id });
    for (const item of keywords) {
        if (message.body.toLowerCase().includes(item.keyword.toLowerCase())) {
            await message.reply(item.reply);
            break;
        }
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    const device = await Device.findOne({ clientId });
    if (device && device.settings.antiDelete && before) {
        const contact = await before.getContact();
        const notification = `Message from ${contact.pushname} was deleted: "${before.body}"`;
        client.sendMessage(client.info.wid._serialized, notification);
    }
});

client.on('incoming_call', async (call) => {
    const device = await Device.findOne({ clientId });
    if (device && device.settings.rejectCalls) {
        await call.reject();
        await client.sendMessage(client.info.wid._serialized, `Rejected a call from ${call.from}`);
    }
});


client.initialize();
clients[clientId] = client;
return client;
