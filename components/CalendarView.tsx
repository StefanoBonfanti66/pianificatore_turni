import React, { useState } from 'react';
import type { Shift, Worker, Machine, Department } from '../types';
import ShiftCard from './ShiftCard';

interface CalendarViewProps {
  shifts: Shift[];
  workers: Worker[];
  machines: Machine[];
  departments: Department[];
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onRequestSwap: (shift: Shift) => void;
  onMoveShift: (shiftId: string, newDate: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  shifts,
  workers,
  machines,
  departments,
  currentDate,
  onDateChange,
  onEditShift,
  onDeleteShift,
  onRequestSwap,
  onMoveShift,
}) => {
  const [draggingShiftId, setDraggingShiftId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const workerMap = new Map(workers.map(w => [w.id, w]));
  const machineMap = new Map(machines.map(m => [m.id, m]));
  const departmentMap = new Map(departments.map(d => [d.id, d]));
  
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    onDateChange(newDate);
  };
  
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, shiftId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', shiftId);
    setDraggingShiftId(shiftId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newDate: string) => {
    e.preventDefault();
    const shiftId = e.dataTransfer.getData('text/plain');
    onMoveShift(shiftId, newDate);
    setDraggingShiftId(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggingShiftId(null);
    setDragOverDate(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 calendar-header">
        <div className="flex items-center space-x-2">
            <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 print-hidden" title="Settimana precedente">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 print-hidden" title="Settimana successiva">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            <button onClick={goToToday} className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 print-hidden">Oggi</button>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-4 sm:mt-0 text-center">
          Settimana del {weekDays[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <div className="w-24"></div> {/* Spacer */}
      </div>
      <h2 className="hidden print:block text-center text-xl font-bold mb-4">
          Pianificazione Settimanale
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden print:grid-cols-3 print:gap-4 print:border-none print:bg-transparent">
        {weekDays.map(day => {
          const dayString = day.toISOString().split('T')[0];
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // Saturday or Sunday

          return (
            <div 
              key={dayString} 
              className={`min-h-[200px] transition-colors duration-200 calendar-day-column ${dragOverDate === dayString ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-50 dark:bg-slate-900/50'} p-2`}
              onDragOver={(e) => handleDragOver(e, dayString)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dayString)}
              onDragEnd={handleDragEnd}
            >
              <div className={`text-center font-semibold mb-2 ${
                isToday(day) 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : isWeekend ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                <span className={`text-xs uppercase`}>{day.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                <p className={`text-xl ${isToday(day) ? 'bg-indigo-600 text-white rounded-full w-8 h-8 mx-auto flex items-center justify-center' : ''}`}>{day.getDate()}</p>
              </div>
              <div className="space-y-3">
                {shifts
                  .filter(shift => new Date(shift.date).toDateString() === day.toDateString())
                  .sort((a,b) => a.startTime.localeCompare(b.startTime))
                  .map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      worker={workerMap.get(shift.workerId)}
                      machine={shift.machineId ? machineMap.get(shift.machineId) : undefined}
                      department={shift.departmentId ? departmentMap.get(shift.departmentId) : undefined}
                      onEdit={onEditShift}
                      onDelete={onDeleteShift}
                      onRequestSwap={onRequestSwap}
                      onDragStart={handleDragStart}
                      isDragging={draggingShiftId === shift.id}
                    />
                  ))}
                  {shifts.filter(shift => new Date(shift.date).toDateString() === day.toDateString()).length === 0 && (
                      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">Nessun turno</div>
                  )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CalendarView;