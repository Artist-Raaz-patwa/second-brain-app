import { useLocalStorage } from './useLocalStorage';
import { Habit, HabitLog } from '../types';

const initialHabits: Habit[] = [
  { id: 'habit-1', name: 'Stretch or do yoga', goal: 20 },
  { id: 'habit-2', name: 'Walk 10,000 steps', goal: 31 },
  { id: 'habit-3', name: 'Read a book chapter', goal: 15 },
  { id: 'habit-4', name: 'Declutter a space', goal: 4 },
  { id: 'habit-5', name: 'Floss', goal: 31 },
];

// Generate some random initial logs for demo purposes
const generateInitialLogs = (habitsToLog: Habit[]): HabitLog[] => {
    const logs: HabitLog[] = [];
    const today = new Date();
    // Generate for the current month
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        // Create a timezone-agnostic YYYY-MM-DD string
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateString = `${year}-${monthStr}-${dayStr}`;

        habitsToLog.forEach(habit => {
            // Give each habit a different probability to look more realistic
            const probability = (habit.goal / daysInMonth) * 0.8; // 80% of goal on average
            if (Math.random() < probability) {
                logs.push({
                    id: `${habit.id}-${dateString}`,
                    habitId: habit.id,
                    date: dateString,
                });
            }
        });
    }
    return logs;
}


export const useHabitData = () => {
    const [habits, setHabits] = useLocalStorage<Habit[]>('secondbrain-habits', initialHabits);
    const [habitLogs, setHabitLogs] = useLocalStorage<HabitLog[]>('secondbrain-habit-logs', () => generateInitialLogs(initialHabits));

    const toggleHabitLog = (habitId: string, date: string) => {
        const logId = `${habitId}-${date}`;
        const logExists = habitLogs.some(log => log.id === logId);

        if (logExists) {
            setHabitLogs(prev => prev.filter(log => log.id !== logId));
        } else {
            const newLog: HabitLog = { id: logId, habitId, date };
            setHabitLogs(prev => [...prev, newLog]);
        }
    };

    const addHabit = (name: string, goal: number) => {
        if (!name.trim() || goal <= 0) return;
        const newHabit: Habit = { id: `habit-${Date.now()}`, name, goal };
        setHabits(prev => [...prev, newHabit]);
    };

    const deleteHabit = (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        setHabitLogs(prev => prev.filter(log => log.habitId !== habitId));
    };
    
    const updateHabit = (habitId: string, updates: Partial<Omit<Habit, 'id'>>) => {
        setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));
    }

    return {
        habits,
        habitLogs,
        toggleHabitLog,
        addHabit,
        deleteHabit,
        updateHabit,
    };
};