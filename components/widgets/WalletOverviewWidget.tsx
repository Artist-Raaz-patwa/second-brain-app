import React, { useMemo } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { useWalletData } from '../../hooks/useWalletData';
import { useSettings } from '../../contexts/SettingsContext';

const WalletOverviewWidget: React.FC = () => {
    const { budgetTotals } = useWalletData();
    const { currency } = useSettings();
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency }), [currency]);
    
    return (
        <WidgetWrapper title="Wallet Overview">
            <div className="flex flex-col h-full justify-around text-center">
                <div>
                    <p className="text-sm text-gray-600 dark:text-white/60">Available to Spend</p>
                    <p className={`text-3xl font-bold tracking-tight ${budgetTotals.availableToSpend >= 0 ? 'text-black dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{currencyFormatter.format(budgetTotals.availableToSpend)}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-600 dark:text-white/60">Total Funds</p>
                    <p className="text-lg font-semibold text-black/80 dark:text-white/80">{currencyFormatter.format(budgetTotals.totalFunds)}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-600 dark:text-white/60">Total Saved</p>
                    <p className="text-lg font-semibold text-black/80 dark:text-white/80">{currencyFormatter.format(budgetTotals.totalSaved)}</p>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default WalletOverviewWidget;