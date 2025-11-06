import React from 'react';
import { BellIcon, PlusIcon, SparklesIcon, CogIcon, UsersIcon, BuildingOfficeIcon } from './icons';

interface HeaderProps {
  onAddShift: () => void;
  onSuggestShifts: () => void;
  onManageWorkers: () => void;
  onManageMachines: () => void;
  onManageDepartments: () => void;
  onToggleNotifications: () => void;
  onOpenConfig: () => void;
  unreadNotificationCount: number;
}

const Header: React.FC<HeaderProps> = ({
  onAddShift,
  onSuggestShifts,
  onManageWorkers,
  onManageMachines,
  onManageDepartments,
  onToggleNotifications,
  onOpenConfig,
  unreadNotificationCount
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-30 print-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Shift Planner Pro</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button
              onClick={onAddShift}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Aggiungi Turno</span>
            </button>
             <button
              onClick={onSuggestShifts}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Suggerimenti AI</span>
            </button>
            
            {/* Mobile buttons */}
            <button
              onClick={onAddShift}
              className="sm:hidden p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Aggiungi Turno"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
             <button
              onClick={onSuggestShifts}
              className="sm:hidden p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Suggerimenti AI"
            >
                <SparklesIcon className="w-6 h-6" />
            </button>

            <div className="h-6 border-l border-slate-200 dark:border-slate-700 mx-2"></div>

            <button onClick={onManageWorkers} title="Gestisci Lavoratori" className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <UsersIcon className="w-6 h-6" />
            </button>
            <button onClick={onManageMachines} title="Gestisci Macchine" className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <CogIcon className="w-6 h-6" />
            </button>
            <button onClick={onManageDepartments} title="Gestisci Reparti" className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <BuildingOfficeIcon className="w-6 h-6" />
            </button>
            
            <div className="h-6 border-l border-slate-200 dark:border-slate-700 mx-2"></div>
            
            <button onClick={onToggleNotifications} className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <BellIcon className="w-6 h-6" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
             <button onClick={onOpenConfig} title="Configurazione Server" className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <CogIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
