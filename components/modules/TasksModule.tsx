
import React from 'react';

const TaskItem = ({ children, checked = false }: { children: React.ReactNode, checked?: boolean }) => (
  <div className="flex items-center gap-3 p-3 border-b border-white/10 last:border-b-0">
    <input type="checkbox" defaultChecked={checked} className="w-4 h-4 rounded bg-white/20 border-white/30 text-white focus:ring-white" />
    <span className={`${checked ? 'line-through text-white/50' : ''}`}>{children}</span>
  </div>
);

const TasksModule: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-full text-white/80">
      <h3 className="text-xl font-semibold mb-4">My Tasks</h3>
      <p className="mb-4">Here you can manage your to-do list, track progress, and stay organized.</p>
      <div className="border border-white/20 rounded-lg">
        <TaskItem>Finalize Q3 report</TaskItem>
        <TaskItem>Prepare presentation slides for Monday</TaskItem>
        <TaskItem checked>Onboard new team member</TaskItem>
        <TaskItem>Book flight for conference</TaskItem>
      </div>
    </div>
  );
};

export default TasksModule;
