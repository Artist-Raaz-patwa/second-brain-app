import WelcomeWidget from './WelcomeWidget';
import QuickNoteWidget from './QuickNoteWidget';
import WalletOverviewWidget from './WalletOverviewWidget';
import RecentTransactionsWidget from './RecentTransactionsWidget';
import SavingsGoalWidget from './SavingsGoalWidget';
import HabitTrackerWidget from './HabitTrackerWidget';

export const ALL_WIDGETS: { [key: string]: any } = {
    'welcome': {
        name: 'Welcome',
        component: WelcomeWidget,
        defaultW: 4,
        defaultH: 4,
        minW: 3,
        minH: 4,
    },
    'quick-note': {
        name: 'Quick Note',
        component: QuickNoteWidget,
        defaultW: 4,
        defaultH: 6,
        minW: 3,
        minH: 5,
    },
    'habit-tracker': {
        name: 'Habit Tracker',
        component: HabitTrackerWidget,
        defaultW: 4,
        defaultH: 6,
        minW: 3,
        minH: 5,
    },
    'wallet-overview': {
        name: 'Wallet Overview',
        component: WalletOverviewWidget,
        defaultW: 4,
        defaultH: 4,
        minW: 3,
        minH: 4,
    },
    'recent-transactions': {
        name: 'Recent Transactions',
        component: RecentTransactionsWidget,
        defaultW: 4,
        defaultH: 6,
        minW: 4,
        minH: 5,
    },
    'savings-goal': {
        name: 'Savings Goal',
        component: SavingsGoalWidget,
        defaultW: 8,
        defaultH: 4,
        minW: 6,
        minH: 4,
    },
};
