export interface Worker {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Machine {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface SwapRequest {
  targetWorkerId: string;
  status: 'pending';
}

export interface Shift {
  id:string;
  workerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  departmentId: string;
  machineId?: string;
  notes?: string;
  swapRequest?: SwapRequest;
}

export interface ShiftSuggestion {
  workerName: string;
  date: string;
  startTime: string;
  endTime: string;
  departmentName: string;
  machineName?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'swap_request' | 'swap_approved' | 'swap_rejected' | 'info';
  read: boolean;
  timestamp: string;
  metadata?: {
    shiftId: string;
    originalWorkerId: string;
    targetWorkerId: string;
  };
}