import type { Shift, Worker, Machine, Department, AppNotification } from '../types';

let API_BASE_URL = 'http://localhost:3001';

export const setApiBaseUrl = (url: string) => {
    let sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    if (sanitizedUrl.endsWith('/api')) {
        sanitizedUrl = sanitizedUrl.slice(0, -4);
    }
    API_BASE_URL = sanitizedUrl;
};

export const getApiBaseUrl = () => API_BASE_URL;

// Private fetch wrapper to handle common logic
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const defaultHeaders: HeadersInit = {
        // This header is crucial to bypass the ngrok browser warning page
        'ngrok-skip-browser-warning': 'true',
    };

    if (options.body) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const headers = {
        ...defaultHeaders,
        ...options.headers,
    };
    
    // API_BASE_URL is now guaranteed to be clean. Endpoints start with /api.
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    return handleResponse(response);
};


const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        // Check if the error is ngrok's HTML page
        if (errorText.includes('ERR_NGROK_')) {
             throw new Error("Errore di connessione con ngrok. L'URL potrebbe essere scaduto o errato.");
        }
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
             throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
    }
    if (response.status === 204) {
        return;
    }
    return response.json();
};

export const testApiConnection = async (baseUrl: string): Promise<boolean> => {
    try {
        let url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        if (url.endsWith('/api')) {
            url = url.slice(0, -4);
        }
        // Use a more robust endpoint for testing, as /data is critical for the app.
        const response = await fetch(`${url}/api/data`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return response.ok;
    } catch (error) {
        console.error("API connection test failed:", error);
        return false;
    }
};

export const fetchData = async (): Promise<{ shifts: Shift[], workers: Worker[], machines: Machine[], departments: Department[], notifications: AppNotification[] }> => {
    return apiFetch('/api/data');
};

export const saveShift = async (shift: Omit<Shift, 'id'>): Promise<Shift> => {
    return apiFetch('/api/shifts', {
        method: 'POST',
        body: JSON.stringify(shift),
    });
};

export const updateShift = async (shift: Shift): Promise<Shift> => {
     return apiFetch(`/api/shifts/${shift.id}`, {
        method: 'PUT',
        body: JSON.stringify(shift),
    });
};

export const deleteShift = async (shiftId: string): Promise<{ id: string }> => {
    return apiFetch(`/api/shifts/${shiftId}`, { method: 'DELETE' });
};

export const checkShiftConflict = async (data: { workerId: string; date: string; startTime: string; endTime: string; shiftIdToIgnore?: string; machineId?: string }): Promise<{ hasConflict: boolean; message: string }> => {
    return apiFetch('/api/shifts/conflict', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const saveWorker = async (workerData: { name: string, avatarUrl: string }): Promise<Worker> => {
    return apiFetch('/api/workers', {
        method: 'POST',
        body: JSON.stringify(workerData),
    });
};

export const updateWorker = async (worker: Worker): Promise<Worker> => {
     return apiFetch(`/api/workers/${worker.id}`, {
        method: 'PUT',
        body: JSON.stringify(worker),
    });
};

export const deleteWorker = async (workerId: string): Promise<{ id: string }> => {
    return apiFetch(`/api/workers/${workerId}`, { method: 'DELETE' });
};

export const saveMachine = async (machineName: string): Promise<Machine> => {
    return apiFetch('/api/machines', {
        method: 'POST',
        body: JSON.stringify({ name: machineName }),
    });
};

export const deleteMachine = async (machineId: string): Promise<{ id: string }> => {
    return apiFetch(`/api/machines/${machineId}`, { method: 'DELETE' });
};

export const saveDepartment = async (departmentName: string): Promise<Department> => {
     return apiFetch('/api/departments', {
        method: 'POST',
        body: JSON.stringify({ name: departmentName }),
    });
};

export const updateDepartment = async (department: Department): Promise<Department> => {
     return apiFetch(`/api/departments/${department.id}`, {
        method: 'PUT',
        body: JSON.stringify(department),
    });
};

export const deleteDepartment = async (departmentId: string): Promise<{ id: string }> => {
    return apiFetch(`/api/departments/${departmentId}`, { method: 'DELETE' });
};

export const proposeSwap = async (shiftId: string, targetWorkerId: string): Promise<{ shift: Shift; notification: AppNotification }> => {
    return apiFetch(`/api/shifts/${shiftId}/swap`, {
        method: 'POST',
        body: JSON.stringify({ targetWorkerId }),
    });
};

export const respondToSwap = async (notificationId: string, response: 'approved' | 'rejected'): Promise<{ updatedShift: Shift; updatedNotifications: AppNotification[] }> => {
    return apiFetch(`/api/notifications/${notificationId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
    });
};

export const markNotificationsAsRead = async (notificationIds: string[]): Promise<AppNotification[]> => {
    return apiFetch('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids: notificationIds }),
    });
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
    return apiFetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
};