import React, { useMemo } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { useWalletData } from '../../hooks/useWalletData';
import { useSettings } from '../../contexts/SettingsContext';

const RecentTransactionsWidget: React.FC = () => {
    const { expenses, getCategoryName } = useWalletData();
    const { currency } = useSettings();
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency }), [currency]);

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);
    
    return (
        <WidgetWrapper title="Recent Transactions">
            <div className="h-full overflow-y-auto">
                {sortedExpenses.length > 0 ? (
                    <ul className="space-y-2 pr-1">
                        {sortedExpenses.slice(0, 10).map(exp => (
                            <li key={exp.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-black dark:text-white truncate">{exp.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-white/50">{getCategoryName(exp.categoryId)}</p>
                                </div>
                                {exp.amount > 0 ? (
                                    <span className="font-mono text-gray-700 dark:text-white/80">-{currencyFormatter.format(exp.amount)}</span>
                                ) : (
                                    <span className="font-mono text-green-600 dark:text-green-400">+{currencyFormatter.format(Math.abs(exp.amount))}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-white/50">
                        <p>No transactions yet.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default RecentTransactionsWidget;