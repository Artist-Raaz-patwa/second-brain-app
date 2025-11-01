
import React from 'react';

const CalendarModule: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-full text-white/80">
      <h3 className="text-xl font-semibold mb-4">My Calendar</h3>
      <p>A full-featured calendar component would be rendered here, showing your events and schedule.</p>
      <div className="mt-4 border border-white/20 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Today</span>
            <span className="text-sm text-white/60">{new Date().toDateString()}</span>
        </div>
        <ul>
            <li className="py-2 border-t border-white/10">10:00 AM - Project Standup</li>
            <li className="py-2 border-t border-white/10">1:00 PM - Lunch with team</li>
            <li className="py-2 border-t border-white/10">3:00 PM - Design Review</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarModule;
