import React from 'react';
import { Module } from '../types';

interface MainContentProps {
  activeModule: Module;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeModule, theme, setTheme, toggleLeftSidebar, toggleRightSidebar }) => {
  const ModuleComponent = activeModule.component;
  const propsToPass = activeModule.id === 'account' ? { theme, setTheme } : {};
  
  const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
  const AiIcon = () => <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 12h4"></path><path d="M12 16h4"></path></svg>;

  return (
    <>
      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <button onClick={toggleLeftSidebar} className="p-2 -ml-2 text-black dark:text-white">
              <HamburgerIcon />
          </button>
          <h1 className="text-lg font-bold tracking-tight">{activeModule.name}</h1>
          <button onClick={toggleRightSidebar} className="p-2 -mr-2 text-black dark:text-white">
               <AiIcon />
          </button>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="hidden md:block mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-black dark:text-white">{activeModule.name}</h1>
          <p className="text-gray-500 dark:text-white/50 mt-1">Your dedicated space for {activeModule.name.toLowerCase()}.</p>
        </header>
        <div className="h-full">
          <ModuleComponent {...propsToPass} />
        </div>
      </main>
    </>
  );
};

export default MainContent;