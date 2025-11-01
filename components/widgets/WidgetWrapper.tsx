import React from 'react';

interface WidgetWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, children, className }) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <header className="p-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <h4 className="font-semibold text-sm tracking-tight text-black dark:text-white">{title}</h4>
      </header>
      <div className="flex-1 p-3 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default WidgetWrapper;