import React, { useState, useEffect, useCallback } from 'react';
import type { Shift, Worker, Machine, Department, AppNotification, ShiftSuggestion } from './types';
import * as api from './services/apiService';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import ShiftModal from './components/ShiftModal';
import SuggestionModal from './components/SuggestionModal';
import SwapRequestModal from './components/SwapRequestModal';
import NotificationPanel from './components/NotificationPanel';
import WorkerManagerModal from './components/WorkerManagerModal';
import MachineManagerModal from './components/MachineManagerModal';
import DepartmentManagerModal from './components/DepartmentManagerModal';
import ConfigModal from './components/ConfigModal';

const App: React.FC = () => {
    // Data state
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    
    // UI State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isWorkerManagerOpen, setIsWorkerManagerOpen] = useState(false);
    const [isMachineManagerOpen, setIsMachineManagerOpen] = useState(false);
    const [isDepartmentManagerOpen, setIsDepartmentManagerOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    
    // State for modals
    const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
    const [shiftForSwap, setShiftForSwap] = useState<Shift | null>(null);
    
    // API Config state
    const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('apiUrl') || '');
    
    const loadData = useCallback(async () => {
        if (!apiUrl) {
            setError("L'URL del backend non è configurato.");
            setIsConfigModalOpen(true);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            api.setApiBaseUrl(apiUrl);
            const data = await api.fetchData() as { shifts: Shift[], workers: Worker[], machines: Machine[], departments: Department[], notifications: AppNotification[] };
            setShifts(data.shifts?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || []);
            setWorkers(data.workers || []);
            setMachines(data.machines || []);
            setDepartments(data.departments || []);
            setNotifications(data.notifications?.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || []);
            setIsConfigModalOpen(false); // Close config modal on success
        } catch (e: any) {
            const errorMessage = e.message || "Impossibile caricare i dati. Assicurati che il server backend sia in esecuzione e l'URL sia corretto.";
            setError(errorMessage);
            setIsConfigModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleSaveApiUrl = (url: string) => {
        setApiUrl(url);
        localStorage.setItem('apiUrl', url);
    };

    // Shift handlers
    const handleAddShiftClick = () => {
        setShiftToEdit(null);
        setIsShiftModalOpen(true);
    };

    const handleEditShiftClick = (shift: Shift) => {
        setShiftToEdit(shift);
        setIsShiftModalOpen(true);
    };
    
    const handleSaveShift = async (shiftData: Shift) => {
        try {
            if (shiftToEdit) {
                const updatedShift = await api.updateShift(shiftData);
                setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
            } else {
                // Server will assign ID, so we omit the temporary client-side ID
                const { id, ...newShiftData } = shiftData; 
                const newShift = await api.saveShift(newShiftData as Omit<Shift, 'id'>);
                setShifts(prev => [...prev, newShift]);
            }
            setIsShiftModalOpen(false);
        } catch (e: any) {
            setError(`Errore nel salvataggio del turno: ${e.message}`);
        }
    };

    const handleDeleteShift = async (shiftId: string) => {
        try {
            await api.deleteShift(shiftId);
            setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
        } catch (e: any) {
            setError(`Errore nell'eliminazione del turno: ${e.message}`);
        }
    };
    
    const handleMoveShift = async (shiftId: string, newDate: string) => {
        const shiftToMove = shifts.find(s => s.id === shiftId);
        if (shiftToMove) {
            // Optimistic update
            const originalShifts = shifts;
            setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, date: newDate } : s));
            
            try {
                await api.updateShift({ ...shiftToMove, date: newDate });
            } catch (e: any) {
                setError(`Errore nello spostamento del turno: ${e.message}`);
                // Rollback on error
                setShifts(originalShifts);
            }
        }
    };

    // Swap handlers
    const handleRequestSwapClick = (shift: Shift) => {
        setShiftForSwap(shift);
        setIsSwapModalOpen(true);
    };

    const handleProposeSwap = async (targetWorkerId: string) => {
        if (!shiftForSwap) return;
        try {
            const { shift, notification } = await api.proposeSwap(shiftForSwap.id, targetWorkerId);
            setShifts(prev => prev.map(s => s.id === shift.id ? shift : s));
            setNotifications(prev => [notification, ...prev]);
            setIsSwapModalOpen(false);
        } catch (e: any) {
            setError(`Errore nella proposta di scambio: ${e.message}`);
        }
    };

    // Suggestion handlers
    const handleApplySuggestions = (suggestions: ShiftSuggestion[]) => {
        const workerMap = new Map(workers.map(w => [w.name, w]));
        const departmentMap = new Map(departments.map(d => [d.name, d]));
        const machineMap = new Map(machines.map(m => [m.name, m]));

        const newShifts: Omit<Shift, 'id'>[] = suggestions.map(s => {
            const worker = workerMap.get(s.workerName);
            const department = departmentMap.get(s.departmentName);
            const machine = s.machineName ? machineMap.get(s.machineName) : undefined;

            if (!worker || !department) {
                console.warn(`Could not create shift for ${s.workerName} in ${s.departmentName}, data mismatch.`);
                return null;
            }

            return {
                workerId: worker.id,
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
                departmentId: department.id,
                machineId: machine?.id
            };
        }).filter((s): s is NonNullable<typeof s> => s !== null);

        // This could be a batch operation API in a real app
        Promise.all(newShifts.map(api.saveShift))
            .then((savedShifts: Shift[]) => {
                setShifts(prev => [...prev, ...savedShifts]);
            })
            .catch(e => setError(`Errore nell'applicazione dei suggerimenti: ${e.message}`));
    };
    
    // Notification handlers
    const handleToggleNotifications = () => {
        setIsNotificationPanelOpen(!isNotificationPanelOpen);
    };
    
    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await api.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch(e: any) {
            setError(`Errore nell'eliminazione della notifica: ${e.message}`);
        }
    };

    const handleRespondToSwap = async (notificationId: string, response: 'approved' | 'rejected') => {
        try {
            const { updatedShift, updatedNotifications } = await api.respondToSwap(notificationId, response) as { updatedShift: Shift, updatedNotifications: AppNotification[] };
            setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
            // This logic assumes the backend returns all notifications that were changed or added
            const updatedNotifMap = new Map(updatedNotifications.map(n => [n.id, n]));
            setNotifications(prev => [
                ...updatedNotifications.filter(un => !prev.some(pn => pn.id === un.id)), // add new
                ...prev.map(n => updatedNotifMap.get(n.id) || n) // update existing
            ].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (e: any) {
            setError(`Errore nella risposta allo scambio: ${e.message}`);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
         try {
            const updated = await api.markNotificationsAsRead([notificationId]);
            setNotifications(prev => prev.map(n => n.id === notificationId ? updated[0] : n));
        } catch (e: any) {
            console.error(`Error marking notification as read: ${e.message}`);
        }
    };


    // Data Management Handlers
    const handleSaveWorker = async (workerData: { name: string, avatarUrl: string }) => {
        const newWorker = await api.saveWorker(workerData);
        setWorkers(prev => [...prev, newWorker]);
    };
    const handleUpdateWorker = async (worker: Worker) => {
        const updatedWorker = await api.updateWorker(worker);
        setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
    };
    const handleDeleteWorker = async (workerId: string) => {
        await api.deleteWorker(workerId);
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        setShifts(prev => prev.filter(s => s.workerId !== workerId)); // Cascade on client
    };

    const handleSaveMachine = async (machineName: string) => {
        const newMachine = await api.saveMachine(machineName);
        setMachines(prev => [...prev, newMachine]);
    };
    const handleDeleteMachine = async (machineId: string) => {
        await api.deleteMachine(machineId);
        setMachines(prev => prev.filter(m => m.id !== machineId));
    };

    const handleSaveDepartment = async (departmentName: string) => {
        const newDepartment = await api.saveDepartment(departmentName);
        setDepartments(prev => [...prev, newDepartment]);
    };
     const handleUpdateDepartment = async (department: Department) => {
        const updated = await api.updateDepartment(department);
        setDepartments(prev => prev.map(d => d.id === updated.id ? updated : d));
    };
    const handleDeleteDepartment = async (departmentId: string) => {
        await api.deleteDepartment(departmentId);
        setDepartments(prev => prev.filter(d => d.id !== departmentId));
    };

    if (isLoading && !isConfigModalOpen) {
        return (
          <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-600 dark:text-slate-300">Caricamento dati...</p>
            </div>
          </div>
        );
    }
    
    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
            <Header
                onAddShift={handleAddShiftClick}
                onSuggestShifts={() => setIsSuggestionModalOpen(true)}
                onManageWorkers={() => setIsWorkerManagerOpen(true)}
                onManageMachines={() => setIsMachineManagerOpen(true)}
                onManageDepartments={() => setIsDepartmentManagerOpen(true)}
                onToggleNotifications={handleToggleNotifications}
                onOpenConfig={() => setIsConfigModalOpen(true)}
                unreadNotificationCount={notifications.filter(n => !n.read).length}
            />
            <main>
                 {error && !isConfigModalOpen && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded-md shadow-lg" role="alert">
                        <div className="flex">
                            <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg></div>
                            <div>
                                <p className="font-bold">Si è verificato un errore</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                <CalendarView
                    shifts={shifts}
                    workers={workers}
                    machines={machines}
                    departments={departments}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onEditShift={handleEditShiftClick}
                    onDeleteShift={handleDeleteShift}
                    onRequestSwap={handleRequestSwapClick}
                    onMoveShift={handleMoveShift}
                />
            </main>
            
            <ShiftModal
                isOpen={isShiftModalOpen}
                onClose={() => setIsShiftModalOpen(false)}
                onSave={handleSaveShift}
                workers={workers}
                machines={machines}
                departments={departments}
                shiftToEdit={shiftToEdit}
            />

            <SuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                workers={workers}
                machines={machines}
                departments={departments}
                shifts={shifts}
                onApplySuggestions={handleApplySuggestions}
            />
            
            <SwapRequestModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                onProposeSwap={handleProposeSwap}
                workers={workers}
                departments={departments}
                shift={shiftForSwap}
            />

            <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                workers={workers}
                shifts={shifts}
                departments={departments}
                onRespondToSwap={handleRespondToSwap}
                onMarkAsRead={handleMarkAsRead}
                onDeleteNotification={handleDeleteNotification}
            />
            
             <WorkerManagerModal
                isOpen={isWorkerManagerOpen}
                onClose={() => setIsWorkerManagerOpen(false)}
                workers={workers}
                onSave={handleSaveWorker}
                onUpdate={handleUpdateWorker}
                onDelete={handleDeleteWorker}
            />

            <MachineManagerModal
                isOpen={isMachineManagerOpen}
                onClose={() => setIsMachineManagerOpen(false)}
                machines={machines}
                onSave={handleSaveMachine}
                onDelete={handleDeleteMachine}
            />
            
            <DepartmentManagerModal
                isOpen={isDepartmentManagerOpen}
                onClose={() => setIsDepartmentManagerOpen(false)}
                departments={departments}
                onSave={handleSaveDepartment}
                onUpdate={handleUpdateDepartment}
                onDelete={handleDeleteDepartment}
            />
            
            <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => { if (apiUrl) setIsConfigModalOpen(false); }}
                onSave={handleSaveApiUrl}
                initialUrl={apiUrl}
                errorMessage={error}
            />

        </div>
    );
};

export default App;