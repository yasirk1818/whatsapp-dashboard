const socket = io();
const addDeviceBtn = document.getElementById('addDeviceBtn');
const deviceListDiv = document.getElementById('deviceList');
const qrModal = document.getElementById('qrModal');
const qrImageContainer = document.getElementById('qrImageContainer');
const qrClientIdP = document.getElementById('qrClientId');

// Fetch and display devices on page load
const fetchDevices = async () => {
    const res = await fetch('/api/devices');
    const devices = await res.json();
    deviceListDiv.innerHTML = ''; // Clear list
    devices.forEach(device => {
        const deviceCard = document.createElement('div');
        deviceCard.className = 'device-card';
        deviceCard.innerHTML = `
            <h3>${device.deviceName}</h3>
            <p>Status: <b class="status-${device.status.toLowerCase()}" id="status-${device.clientId}">${device.status}</b></p>
            <button onclick="deleteDevice('${device._id}')">Delete</button>
            <!-- Baqi buttons (manage, connect) yahan add honge -->
        `;
        deviceListDiv.appendChild(deviceCard);
    });
};

// Add new device
addDeviceBtn.addEventListener('click', async () => {
    const deviceName = document.getElementById('newDeviceName').value;
    const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName })
    });

    if (res.ok) {
        await fetchDevices(); // Refresh the list
    } else {
        alert('Failed to add device.');
    }
});

// Delete device
const deleteDevice = async (deviceId) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    const res = await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
    if (res.ok) {
        await fetchDevices();
    } else {
        alert('Failed to delete device.');
    }
};

// Socket.io event listeners
socket.on('qr_code', (data) => {
    console.log('QR received for:', data.clientId);
    qrClientIdP.textContent = `Client ID: ${data.clientId}`;
    qrImageContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
    qrModal.style.display = 'flex';
});

socket.on('status_update', (data) => {
    console.log('Status update:', data);
    const statusEl = document.getElementById(`status-${data.clientId}`);
    if (statusEl) {
        statusEl.textContent = data.status;
        statusEl.className = `status-${data.status.toLowerCase()}`;
    }
    if (data.status === 'Connected') {
        qrModal.style.display = 'none';
    }
    alert(data.message);
});

// Initial fetch
fetchDevices();
