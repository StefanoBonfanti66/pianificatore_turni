import React, { useState, FormEvent, useEffect } from 'react';
import type { Department } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon } from './icons';

interface DepartmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onSave: (departmentName: string) => void;
  onUpdate: (department: Department) => void;
  onDelete: (departmentId: string) => void;
}

const DepartmentManagerModal: React.FC<DepartmentManagerModalProps> = ({
  isOpen,
  onClose,
  departments,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (!isOpen) {
        setEditingDepartment(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newDepartmentName.trim()) {
      onSave(newDepartmentName.trim());
      setNewDepartmentName('');
    }
  };
  
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setEditedName(department.name);
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setEditedName('');
  };

  const handleSaveUpdate = () => {
    if (editingDepartment && editedName.trim()) {
      onUpdate({ ...editingDepartment, name: editedName.trim() });
      handleCancelEdit();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Gestisci Reparti</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
              <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Nome nuovo reparto"
                  className="flex-grow block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
              />
              <button
                  type="submit"
                  className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                  disabled={!newDepartmentName.trim()}
              >
                  <PlusIcon className="w-5 h-5" />
              </button>
          </form>

          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Reparti Esistenti</h3>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {departments.length > 0 ? (
              departments.map(dep => (
                <div key={dep.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                  <div className="flex items-center space-x-3 flex-grow min-w-0">
                    {editingDepartment?.id === dep.id ? (
                        <input 
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-grow block w-full rounded-md border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    ) : (
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{dep.name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {editingDepartment?.id === dep.id ? (
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
                            <button onClick={() => handleEdit(dep)} className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(dep.id)} className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Nessun reparto aggiunto.</p>
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

export default DepartmentManagerModal;