import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useHabitData } from '../../hooks/useHabitData';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// --- Reusable Components --- //
const DonutChart = ({ progress, size = 120, strokeWidth = 12, title }: { progress: number, size?: number, strokeWidth?: number, title: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (isNaN(progress) ? 0 : progress / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                <circle className="text-gray-200 dark:text-white/10" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle className="text-black dark:text-white" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold tracking-tighter text-black dark:text-white">
                {`${Math.round(isNaN(progress) ? 0 : progress)}%`}
            </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50 w-24">{title}</p>
      </div>
    );
};

const LineChart = ({ data, max }: { data: number[], max: number }) => {
    const width = 300;
    const height = 60;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            <polyline fill="none" className="stroke-current text-black/20 dark:text-white/20" strokeWidth="2" points={points} />
            <polyline fill="none" className="stroke-current text-black dark:text-white" strokeWidth="2" points={points} style={{ strokeDasharray: 500, strokeDashoffset: 500, animation: 'dash 1s ease-out forwards' }} />
             <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
        </svg>
    );
};

const HabitTrackerModule: React.FC = () => {
    const { habits, habitLogs, toggleHabitLog, addHabit, deleteHabit, updateHabit } = useHabitData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [notes, setNotes] = useLocalStorage('secondbrain-habit-notes', '');
    const [editingHabit, setEditingHabit] = useState<any>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed month
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    const todayDateString = useMemo(() => {
        const todayYear = today.getFullYear();
        const todayMonthStr = String(today.getMonth() + 1).padStart(2, '0');
        const todayDayStr = String(today.getDate()).padStart(2, '0');
        return `${todayYear}-${todayMonthStr}-${todayDayStr}`;
    }, [today]);

    const monthLogs = useMemo(() => habitLogs.filter(log => {
        // Use string parsing/comparison to avoid timezone issues.
        const logYear = parseInt(log.date.substring(0, 4), 10);
        const logMonth = parseInt(log.date.substring(5, 7), 10) - 1; // month is 0-indexed
        return logYear === year && logMonth === month;
    }), [habitLogs, year, month]);

    const dailyCompletions = useMemo(() => {
        const completions = Array(daysInMonth).fill(0);
        monthLogs.forEach(log => {
            // Get day from 'YYYY-MM-DD' string to avoid timezone bugs
            const day = parseInt(log.date.substring(8, 10), 10) - 1; // 0-indexed for array
            if (day >= 0 && day < daysInMonth) {
                completions[day]++;
            }
        });
        return completions;
    }, [monthLogs, daysInMonth]);

    const stats = useMemo(() => {
        const totalCompleted = monthLogs.length;
        const totalGoalSum = habits.reduce((sum, h) => sum + h.goal, 0);
        const overallSuccessRate = totalGoalSum > 0 ? (totalCompleted / totalGoalSum) * 100 : 0;
        
        const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
        const expectedProgress = totalGoalSum * (daysPassed / daysInMonth);
        const normalizedProgress = expectedProgress > 0 ? (totalCompleted / expectedProgress) * 100 : 0;
        
        const last3DaysCompletions = dailyCompletions.slice(Math.max(0, daysPassed - 3), daysPassed).reduce((a, b) => a + b, 0);
        const maxPossibleIn3Days = habits.length * Math.min(3, daysPassed);
        const momentum = maxPossibleIn3Days > 0 ? (last3DaysCompletions / maxPossibleIn3Days) * 100 : 0;

        return {
            overallSuccessRate,
            normalizedProgress,
            momentum,
            totalCompleted,
            totalGoalSum,
        }
    }, [monthLogs, habits, dailyCompletions, isCurrentMonth, daysInMonth, today]);

    const handleMonthChange = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const handleEdit = (habit: any) => setEditingHabit({ ...habit });
    const handleUpdateHabit = (e: React.FormEvent) => {
        e.preventDefault();
        updateHabit(editingHabit.id, { name: editingHabit.name, goal: parseInt(editingHabit.goal) });
        setEditingHabit(null);
    };

    const gridRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isCurrentMonth && gridRef.current) {
            const dayCell = gridRef.current.querySelector(`[data-day="${today.getDate()}"]`) as HTMLElement;
            if (dayCell) {
                const scrollLeft = dayCell.offsetLeft - gridRef.current.offsetWidth / 2 + dayCell.offsetWidth / 2;
                gridRef.current.scrollLeft = scrollLeft;
            }
        }
    }, [isCurrentMonth, today]);
    
    return (
        <div className="h-full flex flex-col gap-4 text-black dark:text-white p-1">
            {/* --- Header --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => handleMonthChange(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">&lt;</button>
                        <h2 className="text-lg font-semibold tracking-tight text-center">{monthName} {year}</h2>
                        <button onClick={() => handleMonthChange(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">&gt;</button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mt-2">
                        <span>Start: {new Date(year, month, 1).toLocaleDateString()}</span>
                        <span>End: {new Date(year, month, daysInMonth).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 flex flex-col justify-center col-span-1 md:col-span-2">
                    <div className="h-full">
                        <LineChart data={dailyCompletions} max={habits.length || 1} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                         <div className="text-right">
                             <span className="text-3xl font-bold tracking-tighter">{stats.overallSuccessRate.toFixed(0)}%</span>
                             <p className="text-xs text-gray-500 dark:text-white/50">SUCCESS RATE</p>
                         </div>
                         <p className="text-sm text-gray-500 dark:text-white/50">{stats.totalCompleted} / {stats.totalGoalSum} Completed</p>
                    </div>
                </div>
            </div>

            {/* --- Main Grid & Progress --- */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                <div ref={gridRef} className="flex-1 overflow-auto bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 pr-0">
                    <table className="border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-400 dark:text-white/40">
                                <th className="sticky left-0 bg-white dark:bg-black p-2 w-48 text-left font-semibold">HABIT</th>
                                <th className="p-2 w-16 font-semibold">GOAL</th>
                                {Array.from({ length: daysInMonth }, (_, i) => <th key={i} className="w-8 text-center font-normal">{i + 1}</th>)}
                            </tr>
                            <tr className="text-xs text-gray-400 dark:text-white/40">
                                <th className="sticky left-0 bg-white dark:bg-black p-2 w-48"></th>
                                <th className="p-2 w-16"></th>
                                {Array.from({ length: daysInMonth }, (_, i) => <th key={i} data-day={i+1} className="w-8 text-center font-normal">{new Date(year, month, i + 1).toLocaleDateString('en', { weekday: 'short' })[0]}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map(habit => (
                                <tr key={habit.id} className="border-t border-gray-200 dark:border-white/10">
                                    <td className="sticky left-0 bg-white dark:bg-black p-2 w-48 text-sm font-medium truncate group">
                                        {editingHabit?.id === habit.id ? (
                                            <form onSubmit={handleUpdateHabit} className="flex items-center gap-2">
                                                <input value={editingHabit.name} onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })} className="w-full bg-transparent border-b border-gray-300 dark:border-white/30 focus:outline-none" />
                                            </form>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span>{habit.name}</span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => handleEdit(habit)} className="text-xs">Edit</button>
                                                    <button onClick={() => deleteHabit(habit.id)} className="text-xs text-red-500">Del</button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 w-16 text-sm text-center">
                                         {editingHabit?.id === habit.id ? (
                                            <form onSubmit={handleUpdateHabit} className="flex items-center gap-2">
                                                <input type="number" value={editingHabit.goal} onChange={(e) => setEditingHabit({ ...editingHabit, goal: e.target.value })} className="w-12 bg-transparent border-b border-gray-300 dark:border-white/30 focus:outline-none text-center" />
                                            </form>
                                        ) : (
                                           <span className="text-gray-500 dark:text-white/50">{habit.goal}</span>
                                        )}
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        // Construct date string manually to avoid timezone issues
                                        const monthStr = String(month + 1).padStart(2, '0');
                                        const dayStr = String(day).padStart(2, '0');
                                        const dateString = `${year}-${monthStr}-${dayStr}`;
                                        
                                        const isLogged = monthLogs.some(log => log.habitId === habit.id && log.date === dateString);
                                        const isFuture = dateString > todayDateString;

                                        return (
                                            <td key={i} className="p-1 text-center">
                                                <button disabled={isFuture} onClick={() => toggleHabitLog(habit.id, dateString)} className={`w-6 h-6 border-dotted border border-gray-200 dark:border-white/10 rounded-sm transition-colors ${isLogged ? 'bg-black dark:bg-white' : 'hover:bg-gray-100 dark:hover:bg-white/10'} ${isFuture ? 'opacity-20 cursor-not-allowed' : ''}`}></button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                             <tr>
                                 <td colSpan={daysInMonth + 2} className="p-2">
                                     <button onClick={() => addHabit('New Habit', 15)} className="text-sm text-gray-500 dark:text-white/50 hover:text-black dark:hover:text-white">+ Add new habit</button>
                                 </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="w-full lg:w-48 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 overflow-y-auto flex-shrink-0">
                     <h3 className="text-sm font-semibold mb-3 text-center">PROGRESS</h3>
                     <div className="space-y-4">
                         {habits.map(habit => {
                             const completions = monthLogs.filter(log => log.habitId === habit.id).length;
                             const progress = habit.goal > 0 ? (completions / habit.goal) * 100 : 0;
                             return (
                                 <div key={habit.id}>
                                     <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-xs font-medium truncate">{habit.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-white/50">{progress.toFixed(0)}%</p>
                                     </div>
                                     <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5"><div className="bg-black dark:bg-white h-1.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                                 </div>
                             )
                         })}
                     </div>
                </div>
            </div>

            {/* --- Bottom Summary --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4">
                     <h3 className="text-sm font-semibold mb-2">MONTHLY GOALS</h3>
                     <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write your goals for repeating these habits..." className="w-full h-24 bg-transparent text-sm resize-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/40"></textarea>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0">
                    <DonutChart progress={stats.overallSuccessRate} title="Monthly Progress" />
                    <DonutChart progress={stats.normalizedProgress} title="Progress Normalized" />
                    <DonutChart progress={stats.momentum} title="Last 3 Days Momentum" />
                </div>
            </div>
        </div>
    );
};

export default HabitTrackerModule;