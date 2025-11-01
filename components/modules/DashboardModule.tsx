import React from 'react';
import WelcomeWidget from '../widgets/WelcomeWidget';
import QuickNoteWidget from '../widgets/QuickNoteWidget';
import WalletOverviewWidget from '../widgets/WalletOverviewWidget';
import RecentTransactionsWidget from '../widgets/RecentTransactionsWidget';
import SavingsGoalWidget from '../widgets/SavingsGoalWidget';
import HabitTrackerWidget from '../widgets/HabitTrackerWidget';

const DashboardModule: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
      <div className="lg:col-span-4 h-64">
        <WelcomeWidget />
      </div>
      <div className="lg:col-span-4 h-64">
        <QuickNoteWidget />
      </div>
      <div className="lg:col-span-4 h-64">
        <WalletOverviewWidget />
      </div>
      <div className="lg:col-span-6 h-96">
        <HabitTrackerWidget />
      </div>
      <div className="lg:col-span-6 h-96">
        <RecentTransactionsWidget />
      </div>
      <div className="lg:col-span-12 h-64">
        <SavingsGoalWidget />
      </div>
    </div>
  );
};

export default DashboardModule;