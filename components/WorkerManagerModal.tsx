import React, { useState, FormEvent, useEffect } from 'react';
import type { Worker } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon } from './icons';

interface WorkerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  onSave: (worker: { name: string, avatarUrl: string }) => void;
  onUpdate: (worker: Worker) => void;
  onDelete: (workerId: string) => void;
}

const WorkerManagerModal: React.FC<WorkerManagerModalProps> = ({
  isOpen,
  onClose,
  workers,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [newWorkerName, setNewWorkerName] = useState('');
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (!isOpen) {
        setEditingWorker(null);
        setNewWorkerName('');
    }
  }, [isOpen]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newWorkerName.trim()) {
      // Generate a placeholder avatar URL
      const avatarUrl = `https://i.pravatar.cc/150?u=${encodeURIComponent(newWorkerName.trim())}`;
      onSave({ name: newWorkerName.trim(), avatarUrl });
      setNewWorkerName('');
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setEditedName(worker.name);
  };
  
  const handleCancelEdit = () => {
    setEditingWorker(null);
    setEditedName('');
  };

  const handleSaveUpdate = () => {
    if (editingWorker && editedName.trim()) {
      onUpdate({ ...editingWorker, name: editedName.trim() });
      handleCancelEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Gestisci Lavoratori</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="p-4 border dark:border-slate-700 rounded-md mb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Aggiungi Lavoratore</h3>
            <div className="space-y-3">
                 <input
                    type="text"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="Nome lavoratore"
                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <button
                type="submit"
                className="mt-4 w-full flex justify-center items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={!newWorkerName.trim()}
            >
                <PlusIcon className="w-5 h-5" />
                <span>Aggiungi</span>
            </button>
          </form>

          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Lavoratori Esistenti</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {workers.length > 0 ? (
              workers.map(worker => (
                <div key={worker.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                   <div className="flex items-center space-x-3 flex-grow min-w-0">
                    {editingWorker?.id === worker.id ? (
                        <input 
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    ) : (
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{worker.name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                     {editingWorker?.id === worker.id ? (
                        <>
                            <button onClick={handleSaveUpdate} className="p-1 text-slate-500 hover:text-green-600 dark:hover:text-green-400">
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                             <button onClick={handleCancelEdit} className="p-1 text-slate-500 hover:text-gray-600 dark:hover:text-gray-400">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEdit(worker)} className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(worker.id)} className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nessun lavoratore aggiunto.</p>
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

export default WorkerManagerModal;