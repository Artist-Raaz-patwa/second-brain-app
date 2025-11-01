import React, { useMemo } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { useWalletData } from '../../hooks/useWalletData';
import { useSettings } from '../../contexts/SettingsContext';

const SavingsGoalWidget: React.FC = () => {
    const { budgets } = useWalletData();
    const { currency } = useSettings();
    const primaryGoal = budgets[0];
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency }), [currency]);

    if (!primaryGoal) {
         return (
            <WidgetWrapper title="Primary Savings Goal">
                <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-white/50">
                    <p>No savings goals set up yet.</p>
                </div>
            </WidgetWrapper>
        );
    }
    
    const progress = primaryGoal.targetAmount > 0 ? Math.min((primaryGoal.savedAmount / primaryGoal.targetAmount) * 100, 100) : 0;

    return (
        <WidgetWrapper title="Primary Savings Goal">
            <div className="flex flex-col h-full justify-center">
                 <div className="flex justify-between items-baseline mb-1">
                    <h5 className="font-semibold text-lg text-black dark:text-white">{primaryGoal.name}</h5>
                    <p className="font-semibold text-black/80 dark:text-white/80">{progress.toFixed(1)}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5 mb-2">
                    <div className="bg-black dark:bg-white h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-right text-gray-500 dark:text-white/60">
                    {currencyFormatter.format(primaryGoal.savedAmount)} / {currencyFormatter.format(primaryGoal.targetAmount)}
                </p>
            </div>
        </WidgetWrapper>
    );
};

export default SavingsGoalWidget;