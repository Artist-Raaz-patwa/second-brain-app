import React from 'react';
import { Module } from '../types';

interface LeftSidebarProps {
  modules: Module[];
  activeModuleId: string;
  setActiveModule: (module: Module) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ modules, activeModuleId, setActiveModule, isOpen, setIsOpen }) => {
  const mainModules = modules.filter(m => m.id !== 'account');
  const accountModule = modules.find(m => m.id === 'account');

  const navButtonClass = (isActive: boolean) => `
    w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
    ${
      isActive
        ? 'bg-black text-white dark:bg-white dark:text-black scale-110'
        : 'bg-transparent text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
    }
  `;

  const handleModuleClick = (module: Module) => {
    setActiveModule(module);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-20 flex-shrink-0 bg-gray-50 dark:bg-black 
      border-r border-gray-200 dark:border-white/10 p-4 flex flex-col items-center gap-y-4
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold text-lg">
        SB
      </div>
      <nav className="flex flex-col gap-y-4 mt-8 flex-1 w-full items-center">
        {mainModules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module)}
            title={module.name}
            className={navButtonClass(activeModuleId === module.id)}
          >
            {module.icon}
          </button>
        ))}

        {accountModule && (
          <div className="mt-auto">
            <button
              key={accountModule.id}
              onClick={() => handleModuleClick(accountModule)}
              title={accountModule.name}
              className={navButtonClass(activeModuleId === accountModule.id)}
            >
              {accountModule.icon}
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default LeftSidebar;