import React, { useMemo } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { useHabitData } from '../../hooks/useHabitData';

const HabitTrackerWidget: React.FC = () => {
    const { habits, habitLogs, toggleHabitLog } = useHabitData();
    
    const todayDateString = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const monthStr = String(today.getMonth() + 1).padStart(2, '0');
        const dayStr = String(today.getDate()).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    }, []);

    const completedTodayCount = useMemo(() => {
        return habits.filter(habit => 
            habitLogs.some(log => log.habitId === habit.id && log.date === todayDateString)
        ).length;
    }, [habits, habitLogs, todayDateString]);
    
    const progress = habits.length > 0 ? (completedTodayCount / habits.length) * 100 : 0;

    return (
        <WidgetWrapper title="Today's Habits">
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-1">
                    {habits.length > 0 ? (
                        <ul className="space-y-2">
                            {habits.map(habit => {
                                const isCompleted = habitLogs.some(log => log.habitId === habit.id && log.date === todayDateString);
                                return (
                                    <li key={habit.id}>
                                        <button
                                            onClick={() => toggleHabitLog(habit.id, todayDateString)}
                                            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 ${
                                                isCompleted 
                                                ? 'bg-black dark:bg-white border-black dark:border-white' 
                                                : 'bg-transparent border-gray-300 dark:border-white/30 group-hover:border-black dark:group-hover:border-white'
                                            }`}>
                                                {isCompleted && <svg className="w-3 h-3 text-white dark:text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                            <span className={`text-sm text-left ${isCompleted ? 'line-through text-gray-400 dark:text-white/40' : 'text-black dark:text-white'}`}>{habit.name}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-white/50">
                            <p>No habits set up yet.</p>
                        </div>
                    )}
                </div>
                <div className="pt-2 mt-auto">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-white/50">Daily Progress</p>
                        <p className="text-sm font-semibold text-black dark:text-white">{progress.toFixed(0)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                        <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default HabitTrackerWidget;