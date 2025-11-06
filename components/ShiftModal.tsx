import React, { useState, useEffect, FormEvent, useRef } from 'react';
import type { Shift, Worker, Machine, Department } from '../types';
import { CloseIcon, SwapIcon } from './icons'; // SwapIcon might be used for a warning
import * as api from '../services/apiService';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  workers: Worker[];
  machines: Machine[];
  departments: Department[];
  shiftToEdit: Shift | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, workers, machines, departments, shiftToEdit }) => {
  const [formData, setFormData] = useState<Omit<Shift, 'id'>>({
    workerId: '',
    date: '',
    startTime: '',
    endTime: '',
    departmentId: '',
    notes: '',
    machineId: '',
  });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const conflictCheckTimeout = useRef<number | null>(null);

  useEffect(() => {
    const getInitialDepartmentId = () => {
      if (shiftToEdit) return shiftToEdit.departmentId;
      if (departments.length > 0) return departments[0].id;
      return '';
    };

    if (shiftToEdit) {
      setFormData({
        workerId: shiftToEdit.workerId,
        date: shiftToEdit.date,
        startTime: shiftToEdit.startTime,
        endTime: shiftToEdit.endTime,
        departmentId: shiftToEdit.departmentId,
        notes: shiftToEdit.notes || '',
        machineId: shiftToEdit.machineId || '',
      });
    } else {
      // Reset form when opening for a new shift
      setFormData({
        workerId: workers.length > 0 ? workers[0].id : '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '16:00',
        departmentId: getInitialDepartmentId(),
        notes: '',
        machineId: '',
      });
    }
    setConflictWarning(null); // Reset warning on open
  }, [shiftToEdit, isOpen, workers, departments]);

  // Effect for real-time conflict checking
  useEffect(() => {
    if (conflictCheckTimeout.current) {
        clearTimeout(conflictCheckTimeout.current);
    }

    if (!formData.workerId || !formData.date || !formData.startTime || !formData.endTime) {
        return;
    }
    
    conflictCheckTimeout.current = window.setTimeout(async () => {
        try {
            const result = await api.checkShiftConflict({
                ...formData,
                shiftIdToIgnore: shiftToEdit?.id
            });
            if (result.hasConflict) {
                setConflictWarning(result.message);
            } else {
                setConflictWarning(null);
            }
        } catch (error) {
            console.error("Failed to check for conflicts", error);
            setConflictWarning("Impossibile verificare i conflitti.");
        }
    }, 500); // Debounce for 500ms

    return () => {
        if (conflictCheckTimeout.current) {
            clearTimeout(conflictCheckTimeout.current);
        }
    }
  }, [formData.workerId, formData.machineId, formData.date, formData.startTime, formData.endTime, shiftToEdit]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const shiftData: Shift = {
      id: shiftToEdit ? shiftToEdit.id : new Date().toISOString(),
      ...formData,
      machineId: formData.machineId || undefined,
    };
    onSave(shiftData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{shiftToEdit ? 'Modifica Turno' : 'Aggiungi Nuovo Turno'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="workerId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lavoratore</label>
            <select id="workerId" name="workerId" value={formData.workerId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ora Inizio</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ora Fine</label>
              <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reparto</label>
            <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="machineId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Macchina (Opzionale)</label>
            <select id="machineId" name="machineId" value={formData.machineId} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="">Nessuna macchina</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.id}>{machine.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Note opzionali..."></textarea>
          </div>
          
          {conflictWarning && (
            <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.024 2.251-1.024 2.887 0l7.252 11.69a1.75 1.75 0 01-1.444 2.711H2.449a1.75 1.75 0 01-1.444-2.711L8.257 3.099zM10 13.5a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.008a1 1 0 011 1v2.007a1 1 0 11-2 0V9.5z" clipRule="evenodd" />
              </svg>
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Annulla
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Salva Turno
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ShiftModal;