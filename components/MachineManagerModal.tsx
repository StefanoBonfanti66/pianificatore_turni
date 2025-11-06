import React, { useState, FormEvent } from 'react';
import type { Machine } from '../types';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

interface MachineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  onSave: (machineName: string) => void;
  onDelete: (machineId: string) => void;
}

const MachineManagerModal: React.FC<MachineManagerModalProps> = ({
  isOpen,
  onClose,
  machines,
  onSave,
  onDelete,
}) => {
  const [newMachineName, setNewMachineName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMachineName.trim()) {
      onSave(newMachineName.trim());
      setNewMachineName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Gestisci Macchine</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={newMachineName}
              onChange={(e) => setNewMachineName(e.target.value)}
              placeholder="Nome nuova macchina"
              className="flex-grow block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              disabled={!newMachineName.trim()}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </form>

          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Macchine Esistenti</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {machines.length > 0 ? (
              machines.map(machine => (
                <div key={machine.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{machine.name}</p>
                  <button onClick={() => onDelete(machine.id)} className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nessuna macchina aggiunta.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-500">
            Chiudi
          </button>
        </div>
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

export default MachineManagerModal;
