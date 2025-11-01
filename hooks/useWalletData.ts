import { useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Account, Category, Expense, Budget } from '../types';

const initialCategories: Category[] = [
    { id: 'food', name: 'Food', color: 'bg-gray-800 dark:bg-white' },
    { id: 'transport', name: 'Transport', color: 'bg-gray-700 dark:bg-white/80' },
    { id: 'shopping', name: 'Shopping', color: 'bg-gray-600 dark:bg-white/60' },
    { id: 'bills', name: 'Bills', color: 'bg-gray-500 dark:bg-white/40' },
    { id: 'other', name: 'Other', color: 'bg-gray-400 dark:bg-white/20' },
    { id: 'internal-transfer', name: 'Savings Goal Transfer', color: 'bg-gray-500 dark:bg-white/50' },
];

const initialAccounts: Account[] = [
    { id: 'bank', name: 'Bank', balance: 1000, includeInBudget: true },
    { id: 'cash', name: 'Cash', balance: 150, includeInBudget: true },
    { id: 'card', name: 'Credit Card', balance: -200, includeInBudget: false },
];

const availableColors = [
    'bg-gray-800 dark:bg-white', 'bg-gray-700 dark:bg-white/90', 'bg-gray-600 dark:bg-white/80', 'bg-gray-500 dark:bg-white/70', 'bg-gray-400 dark:bg-white/60', 'bg-gray-300 dark:bg-white/50',
];

const migrateAccounts = (parsed: any[]): Account[] => {
    return parsed.map((acc: Account) => ({ ...acc, includeInBudget: acc.includeInBudget ?? true }));
}
const migrateBudgets = (parsed: any[]): Budget[] => {
    return parsed.map((b: any) => ({ ...b, savedAmount: b.savedAmount || 0 }));
}

export const useWalletData = () => {
    const [accounts, setAccounts] = useLocalStorage<Account[]>('secondbrain-wallet-accounts', initialAccounts);
    const [categories, setCategories] = useLocalStorage<Category[]>('secondbrain-wallet-categories', initialCategories);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('secondbrain-wallet-expenses', []);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>('secondbrain-wallet-budgets', []);

    // Simple data migration for older data structures
    useEffect(() => {
        const rawAccounts = localStorage.getItem('secondbrain-wallet-accounts');
        if (rawAccounts && !JSON.parse(rawAccounts)[0]?.hasOwnProperty('includeInBudget')) {
            setAccounts(migrateAccounts(JSON.parse(rawAccounts)));
        }
        const rawBudgets = localStorage.getItem('secondbrain-wallet-budgets');
        if (rawBudgets && !JSON.parse(rawBudgets)[0]?.hasOwnProperty('savedAmount')) {
             setBudgets(migrateBudgets(JSON.parse(rawBudgets)));
        }
    }, []);
    
    useEffect(() => {
        // Ensures the special 'internal-transfer' category exists for users with pre-existing data
        if (!categories.some(c => c.id === 'internal-transfer')) {
            setCategories(prev => [...prev, { id: 'internal-transfer', name: 'Savings Goal Transfer', color: 'bg-gray-500 dark:bg-white/50' }]);
        }
    }, [categories, setCategories]);


    const budgetTotals = useMemo(() => {
        const totalFunds = accounts.filter(acc => acc.includeInBudget).reduce((sum, acc) => sum + acc.balance, 0);
        const totalSaved = budgets.reduce((sum, budget) => sum + budget.savedAmount, 0);
        const availableToSpend = totalFunds - totalSaved;
        return { totalFunds, totalSaved, availableToSpend };
    }, [accounts, budgets]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
    const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';

    return {
        accounts, setAccounts,
        categories, setCategories,
        expenses, setExpenses,
        budgets, setBudgets,
        budgetTotals,
        getCategoryName,
        getAccountName,
        availableColors,
    };
};
