import { Module } from './types';
import NotesModule from './components/modules/NotesModule';
import WalletModule from './components/modules/WalletModule';
import SettingsModule from './components/modules/SettingsModule';
import DashboardModule from './components/modules/DashboardModule';
import CRMModule from './components/modules/CRMModule';
import HabitTrackerModule from './components/modules/HabitTrackerModule';

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const DashboardIcon = () => <IconWrapper><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></IconWrapper>;
const NotesIcon = () => <IconWrapper><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></IconWrapper>;
const WalletIcon = () => <IconWrapper><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></IconWrapper>;
const HabitTrackerIcon = () => <IconWrapper><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></IconWrapper>;
const CRMIcon = () => <IconWrapper><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></IconWrapper>;
const UserIcon = () => <IconWrapper><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></IconWrapper>;

export const MODULES: Module[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon />, component: DashboardModule },
  { id: 'notes', name: 'Notes', icon: <NotesIcon />, component: NotesModule },
  { id: 'wallet', name: 'Wallet', icon: <WalletIcon />, component: WalletModule },
  { id: 'habits', name: 'Habit Tracker', icon: <HabitTrackerIcon />, component: HabitTrackerModule },
  { id: 'crm', name: 'CRM', icon: <CRMIcon />, component: CRMModule },
  { id: 'account', name: 'Account', icon: <UserIcon />, component: SettingsModule },
];