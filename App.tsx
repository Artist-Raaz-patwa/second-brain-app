import React, { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { MODULES } from './constants';
import { Module } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(MODULES[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('secondbrain-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true);

  useEffect(() => {
    localStorage.setItem('secondbrain-theme', theme);
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark');
    } else {
      body.classList.add('dark');
    }
  }, [theme]);

  const closeMobileSidebars = () => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarCollapsed(true);
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden">
      {/* Backdrop for mobile sidebars */}
      {(isLeftSidebarOpen || !isRightSidebarCollapsed) && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeMobileSidebars}
        />
      )}

      <LeftSidebar 
        modules={MODULES} 
        activeModuleId={activeModule.id} 
        setActiveModule={setActiveModule}
        isOpen={isLeftSidebarOpen}
        setIsOpen={setIsLeftSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent 
          activeModule={activeModule}
          theme={theme}
          setTheme={setTheme}
          toggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          toggleRightSidebar={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        />
      </div>

      <RightSidebar 
        isCollapsed={isRightSidebarCollapsed}
        setIsCollapsed={setIsRightSidebarCollapsed}
      />
    </div>
  );
};

export default App;