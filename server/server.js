const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// --- Utility Functions ---
const readData = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const defaultData = { workers: [], machines: [], departments: [], shifts: [], notifications: [] };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const jsonData = JSON.parse(data);
        // Ensure all top-level keys exist
        return {
            workers: jsonData.workers || [],
            machines: jsonData.machines || [],
            departments: jsonData.departments || [],
            shifts: jsonData.shifts || [],
            notifications: jsonData.notifications || [],
        };
    } catch (error) {
        console.error("Error reading or parsing db.json:", error);
        // Return a default structure on error to prevent crashes
        return { workers: [], machines: [], departments: [], shifts: [], notifications: [] };
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to db.json:", error);
    }
};

// --- API Endpoints ---

// Health check for frontend
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Get all data at once
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// --- Shifts ---
app.post('/api/shifts', (req, res) => {
    const data = readData();
    const newShift = { id: `s${randomUUID()}`, ...req.body };
    data.shifts.push(newShift);
    writeData(data);
    res.status(201).json(newShift);
});

app.put('/api/shifts/:id', (req, res) => {
    const data = readData();
    const shiftIndex = data.shifts.findIndex(s => s.id === req.params.id);
    if (shiftIndex === -1) return res.status(404).json({ message: 'Shift not found' });
    data.shifts[shiftIndex] = { ...data.shifts[shiftIndex], ...req.body };
    writeData(data);
    res.json(data.shifts[shiftIndex]);
});

app.delete('/api/shifts/:id', (req, res) => {
    const data = readData();
    const initialLength = data.shifts.length;
    data.shifts = data.shifts.filter(s => s.id !== req.params.id);
    if (data.shifts.length === initialLength) {
        return res.status(404).json({ message: 'Shift not found' });
    }
    // Cascade delete notifications
    data.notifications = data.notifications.filter(n => n.metadata?.shiftId !== req.params.id);
    writeData(data);
    res.status(200).json({ id: req.params.id });
});

app.post('/api/shifts/conflict', (req, res) => {
    const { workerId, date, startTime, endTime, shiftIdToIgnore, machineId } = req.body;
    const data = readData();
    
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    const workerConflict = data.shifts.find(s => {
        if (s.id === shiftIdToIgnore || s.workerId !== workerId || s.date !== date) {
            return false;
        }
        const existingStart = new Date(`${s.date}T${s.startTime}`);
        const existingEnd = new Date(`${s.date}T${s.endTime}`);
        return (start < existingEnd && end > existingStart);
    });

    if (workerConflict) {
        const worker = data.workers.find(w => w.id === workerId);
        return res.json({ hasConflict: true, message: `${worker?.name || 'Lavoratore'} è già impegnato in un turno che si sovrappone.` });
    }

    if(machineId) {
        const machineConflict = data.shifts.find(s => {
            if (s.id === shiftIdToIgnore || s.machineId !== machineId || s.date !== date) {
                return false;
            }
            const existingStart = new Date(`${s.date}T${s.startTime}`);
            const existingEnd = new Date(`${s.date}T${s.endTime}`);
            return (start < existingEnd && end > existingStart);
        });
        if (machineConflict) {
            const machine = data.machines.find(m => m.id === machineId);
            return res.json({ hasConflict: true, message: `La macchina ${machine?.name || ''} è già in uso in un turno che si sovrappone.` });
        }
    }

    res.json({ hasConflict: false, message: '' });
});


// --- Workers, Machines, Departments (Generic CRUD) ---
const createCrudEndpoints = (entityName) => {
    app.get(`/api/${entityName}`, (req, res) => {
        const data = readData();
        res.json(data[entityName]);
    });
    app.post(`/api/${entityName}`, (req, res) => {
        const data = readData();
        const newItem = { id: `${entityName.charAt(0)}${randomUUID()}`, ...req.body };
        data[entityName].push(newItem);
        writeData(data);
        res.status(201).json(newItem);
    });
     app.put(`/api/${entityName}/:id`, (req, res) => {
        const data = readData();
        const itemIndex = data[entityName].findIndex(i => i.id === req.params.id);
        if (itemIndex === -1) return res.status(404).json({ message: `${entityName} not found` });
        data[entityName][itemIndex] = { ...data[entityName][itemIndex], ...req.body };
        writeData(data);
        res.json(data[entityName][itemIndex]);
    });
    app.delete(`/api/${entityName}/:id`, (req, res) => {
        const data = readData();
        const initialLength = data[entityName].length;
        data[entityName] = data[entityName].filter(i => i.id !== req.params.id);
        if(data[entityName].length === initialLength) {
             return res.status(404).json({ message: `${entityName} not found` });
        }

        // Cascade logic
        if (entityName === 'workers') {
            data.shifts = data.shifts.filter(s => s.workerId !== req.params.id);
        }
        if (entityName === 'machines') {
            data.shifts = data.shifts.map(s => s.machineId === req.params.id ? { ...s, machineId: undefined } : s);
        }
        if (entityName === 'departments') {
            data.shifts = data.shifts.map(s => s.departmentId === req.params.id ? { ...s, departmentId: undefined } : s);
        }

        writeData(data);
        res.status(200).json({ id: req.params.id });
    });
};

createCrudEndpoints('workers');
createCrudEndpoints('machines');
createCrudEndpoints('departments');

// --- Notifications & Swaps ---
app.post('/api/shifts/:id/swap', (req, res) => {
    const { targetWorkerId } = req.body;
    const shiftId = req.params.id;
    const data = readData();
    
    const shiftIndex = data.shifts.findIndex(s => s.id === shiftId);
    if (shiftIndex === -1) return res.status(404).json({ message: "Shift not found" });

    const originalWorker = data.workers.find(w => w.id === data.shifts[shiftIndex].workerId);
    const targetWorker = data.workers.find(w => w.id === targetWorkerId);
    if (!originalWorker || !targetWorker) return res.status(404).json({ message: "Worker not found" });

    // Update shift with swap request
    data.shifts[shiftIndex].swapRequest = { targetWorkerId, status: 'pending' };

    // Create notification
    const newNotification = {
        id: `n${randomUUID()}`,
        message: `${originalWorker.name} ha proposto uno scambio di turno a ${targetWorker.name}`,
        type: 'swap_request',
        read: false,
        timestamp: new Date().toISOString(),
        metadata: {
            shiftId,
            originalWorkerId: originalWorker.id,
            targetWorkerId,
        }
    };
    data.notifications.unshift(newNotification);

    writeData(data);
    res.status(200).json({ shift: data.shifts[shiftIndex], notification: newNotification });
});

app.post('/api/notifications/:id/respond', (req, res) => {
    const { response } = req.body; // 'approved' or 'rejected'
    const notificationId = req.params.id;
    const data = readData();

    const notifIndex = data.notifications.findIndex(n => n.id === notificationId);
    if (notifIndex === -1) return res.status(404).json({ message: "Notification not found" });

    const notification = data.notifications[notifIndex];
    if (notification.type !== 'swap_request' || !notification.metadata) {
        return res.status(400).json({ message: "Invalid notification type" });
    }

    const shiftIndex = data.shifts.findIndex(s => s.id === notification.metadata.shiftId);
    if (shiftIndex === -1) return res.status(404).json({ message: "Associated shift not found" });

    const originalWorker = data.workers.find(w => w.id === notification.metadata.originalWorkerId);
    const targetWorker = data.workers.find(w => w.id === notification.metadata.targetWorkerId);

    // Mark original notification as read
    data.notifications[notifIndex].read = true;
    let updatedNotifications = [data.notifications[notifIndex]];

    if (response === 'approved') {
        data.shifts[shiftIndex].workerId = notification.metadata.targetWorkerId;
        delete data.shifts[shiftIndex].swapRequest;
        
        const approvalNotif = {
            id: `n${randomUUID()}`,
            message: `La tua richiesta di scambio a ${targetWorker?.name} è stata approvata.`,
            type: 'swap_approved', read: false, timestamp: new Date().toISOString()
        };
        const confirmationNotif = {
            id: `n${randomUUID()}`,
            message: `Hai accettato lo scambio con ${originalWorker?.name}. Il turno è tuo.`,
            type: 'swap_approved', read: false, timestamp: new Date().toISOString()
        };
        data.notifications.unshift(approvalNotif, confirmationNotif);
        updatedNotifications.push(approvalNotif, confirmationNotif);

    } else { // rejected
        delete data.shifts[shiftIndex].swapRequest;

        const rejectionNotif = {
            id: `n${randomUUID()}`,
            message: `La tua richiesta di scambio a ${targetWorker?.name} è stata rifiutata.`,
            type: 'swap_rejected', read: false, timestamp: new Date().toISOString()
        };
        data.notifications.unshift(rejectionNotif);
        updatedNotifications.push(rejectionNotif);
    }
    
    writeData(data);
    res.status(200).json({ updatedShift: data.shifts[shiftIndex], updatedNotifications });
});


app.post('/api/notifications/read', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: "Invalid payload" });
    
    const data = readData();
    const updated = [];
    data.notifications.forEach(n => {
        if (ids.includes(n.id)) {
            n.read = true;
            updated.push(n);
        }
    });
    
    writeData(data);
    res.status(200).json(updated);
});

app.delete('/api/notifications/:id', (req, res) => {
    const data = readData();
    const initialLength = data.notifications.length;
    data.notifications = data.notifications.filter(n => n.id !== req.params.id);
    if (data.notifications.length === initialLength) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    writeData(data);
    res.status(204).send();
});


app.listen(PORT, () => {
    console.log(`Backend per la Gestione Turni in ascolto sulla porta ${PORT}`);
});
