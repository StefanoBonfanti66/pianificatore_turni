import React from 'react';
import type { Shift, Worker, Machine, Department } from '../types';
import { PencilIcon, TrashIcon, SwapIcon } from './icons';

interface ShiftCardProps {
  shift: Shift;
  worker?: Worker;
  machine?: Machine;
  department?: Department;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
  onRequestSwap: (shift: Shift) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, shiftId: string) => void;
  isDragging: boolean;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, worker, machine, department, onEdit, onDelete, onRequestSwap, onDragStart, isDragging }) => {
  const isSwapPending = shift.swapRequest?.status === 'pending';
  
  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(shift);
  }
  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(shift.id);
  }
  const handleSwap = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRequestSwap(shift);
  }

  return (
    <div 
      draggable="true"
      onDragStart={(e) => onDragStart(e, shift.id)}
      className={`p-3 rounded-lg shadow-sm border-l-4 transition-opacity duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${
        isSwapPending ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-indigo-500 bg-white dark:bg-slate-800'
      } shift-card`}
    >
      <div className="flex justify-between items-start space-x-2">
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white break-words">{worker?.name || 'Lavoratore non assegnato'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{shift.startTime} - {shift.endTime}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center space-y-1">
          <button onClick={handleEdit} className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full" title="Modifica Turno">
            <PencilIcon className="w-4 h-4 pointer-events-none" />
          </button>
          <button onClick={handleDelete} className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full" title="Elimina Turno">
            <TrashIcon className="w-4 h-4 pointer-events-none" />
          </button>
        </div>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        {department && <p className="text-slate-600 dark:text-slate-300">Rep: {department.name}</p>}
        {machine && <p className="text-slate-600 dark:text-slate-300">Mac: {machine.name}</p>}
        {shift.notes && <p className="text-xs text-slate-500 italic mt-1 pt-1 border-t dark:border-slate-700">"{shift.notes}"</p>}
      </div>
      <div className="mt-2 pt-2 border-t dark:border-slate-700 flex justify-between items-center">
        {isSwapPending ? (
          <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
            Richiesta in attesa
          </div>
        ) : (
          <button onClick={handleSwap} className="flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300" title="Richiedi Scambio">
            <SwapIcon className="w-4 h-4 pointer-events-none" />
            <span>Scambia</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;