import React, { useState, useEffect } from 'react';
import type { Shift, Worker, Department } from '../types';
import { CloseIcon } from './icons';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposeSwap: (targetWorkerId: string) => void;
  workers: Worker[];
  departments: Department[];
  shift: Shift | null;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ isOpen, onClose, onProposeSwap, workers, departments, shift }) => {
  const [targetWorkerId, setTargetWorkerId] = useState('');

  const availableWorkers = workers.filter(w => w.id !== shift?.workerId);

  useEffect(() => {
    if (availableWorkers.length > 0) {
      setTargetWorkerId(availableWorkers[0].id);
    }
  }, [shift, workers, availableWorkers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetWorkerId) {
      onProposeSwap(targetWorkerId);
    }
  };

  if (!isOpen || !shift) return null;

  const currentWorker = workers.find(w => w.id === shift.workerId);
  const department = departments.find(d => d.id === shift.departmentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Richiedi Scambio Turno</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-2 mb-6 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Turno da Scambiare:</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{currentWorker?.name}</span> - {department?.name || 'Reparto non specificato'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {shift.date} dalle {shift.startTime} alle {shift.endTime}
            </p>
          </div>

          <div>
            <label htmlFor="targetWorkerId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Proponi scambio a:</label>
            <select
              id="targetWorkerId"
              name="targetWorkerId"
              value={targetWorkerId}
              onChange={(e) => setTargetWorkerId(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {availableWorkers.map(worker => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Annulla
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={!targetWorkerId}>
              Invia Richiesta
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

export default SwapRequestModal;