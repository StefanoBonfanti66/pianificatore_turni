import React from 'react';
import type { AppNotification, Worker, Shift, Department } from '../types';
import { BellIcon, CheckCircleIcon, XCircleIcon, CloseIcon } from './icons';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  workers: Worker[];
  shifts: Shift[];
  departments: Department[];
  onRespondToSwap: (notificationId: string, response: 'approved' | 'rejected') => void;
  onMarkAsRead: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  workers,
  shifts,
  departments,
  onRespondToSwap,
  onMarkAsRead,
  onDeleteNotification
}) => {
  if (!isOpen) return null;

  const getNotificationDetails = (notification: AppNotification) => {
    const workerMap = new Map(workers.map(w => [w.id, w.name]));
    const shift = shifts.find(s => s.id === notification.metadata?.shiftId);
    
    if (!shift || !notification.metadata) return { text: notification.message };

    const originalWorkerName = workerMap.get(notification.metadata.originalWorkerId) || 'Sconosciuto';
    const targetWorkerName = workerMap.get(notification.metadata.targetWorkerId) || 'Sconosciuto';
    const departmentName = departments.find(d => d.id === shift.departmentId)?.name || '';

    const shiftInfo = `${departmentName} il ${shift.date} (${shift.startTime}-${shift.endTime})`;

    switch (notification.type) {
      case 'swap_request':
        return { text: `${originalWorkerName} ha proposto uno scambio a ${targetWorkerName} per il turno:`, shiftInfo };
      case 'swap_approved':
         return { text: notification.message, shiftInfo: '' };
      case 'swap_rejected':
         return { text: notification.message, shiftInfo: '' };
      default:
        return { text: notification.message };
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Notifiche</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="h-[calc(100%-65px)] overflow-y-auto">
            {sortedNotifications.length > 0 ? (
                <ul>
                    {sortedNotifications.map(notification => {
                        const { text, shiftInfo } = getNotificationDetails(notification);
                        return (
                            <li key={notification.id} className={`p-4 border-b dark:border-slate-700 group relative ${notification.read ? 'opacity-60' : ''}`}>
                                <button 
                                    onClick={() => onDeleteNotification(notification.id)}
                                    className="absolute top-2 right-2 p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Elimina notifica"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                                <div className="flex justify-between items-start">
                                    <div className="pr-6">
                                        <p className="text-sm text-slate-700 dark:text-slate-200">{text}</p>
                                        {shiftInfo && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{shiftInfo}</p>}
                                        <p className="text-xs text-slate-400 mt-2">{new Date(notification.timestamp).toLocaleString()}</p>
                                    </div>
                                    {!notification.read && (
                                        <button onClick={() => onMarkAsRead(notification.id)} title="Segna come letto" className="flex-shrink-0 ml-2 mt-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></button>
                                    )}
                                </div>

                                {notification.type === 'swap_request' && !notification.read && (
                                    <div className="flex items-center space-x-2 mt-3">
                                        <button onClick={() => onRespondToSwap(notification.id, 'approved')} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>Accetta</span>
                                        </button>
                                        <button onClick={() => onRespondToSwap(notification.id, 'rejected')} className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                                            <XCircleIcon className="w-4 h-4" />
                                            <span>Rifiuta</span>
                                        </button>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-center p-8">
                    <BellIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="mt-4 text-sm text-slate-500">Nessuna notifica.</p>
                </div>
            )}
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default NotificationPanel;