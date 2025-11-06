import React, { useState } from 'react';
import { generateShiftSuggestions } from '../services/geminiService';
import type { Worker, Shift, ShiftSuggestion, Machine, Department } from '../types';
import { CloseIcon, SparklesIcon } from './icons';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  machines: Machine[];
  departments: Department[];
  shifts: Shift[];
  onApplySuggestions: (suggestions: ShiftSuggestion[]) => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, workers, machines, departments, shifts, onApplySuggestions }) => {
  const [requirements, setRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ShiftSuggestion[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
        const workerMap = new Map(workers.map(w => [w.id, w.name]));
        const existingShiftsForPrompt = shifts.map(s => ({
            date: s.date,
            workerName: workerMap.get(s.workerId) || 'Sconosciuto'
        }));
      const result = await generateShiftSuggestions(requirements, workers, machines, departments, existingShiftsForPrompt);
      setSuggestions(result);
    } catch (e: any) {
      setError(e.message || 'Si è verificato un errore sconosciuto.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    onApplySuggestions(suggestions);
    onClose();
    setSuggestions([]);
    setRequirements('');
  };

  const handleClose = () => {
    onClose();
    // Reset state on close
    setRequirements('');
    setError(null);
    setSuggestions([]);
    setIsLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Suggerimenti Turni AI</h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Descrivi i turni di cui hai bisogno
          </label>
          <textarea
            id="requirements"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="es. 'Due turni mattutini in Assemblaggio sulla Pressa A, un turno notturno in Imballaggio per domani.'"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !requirements}
            className="mt-4 w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generazione in corso...
              </>
            ) : 'Genera Suggerimenti'}
          </button>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Turni Suggeriti</h3>
              <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                  <li key={index} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{s.workerName}</p>
                    <p className="text-slate-600 dark:text-slate-300">{s.departmentName} il {s.date} dalle {s.startTime} alle {s.endTime}</p>
                    {s.machineName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Macchina: {s.machineName}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-lg">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white dark:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Annulla
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={suggestions.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            Applica {suggestions.length > 0 ? suggestions.length : ''} Suggerimenti
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

export default SuggestionModal;