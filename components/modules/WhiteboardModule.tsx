
import React from 'react';

const WhiteboardModule: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-full text-white/80 flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold mb-4">Digital Whiteboard</h3>
      <p className="text-center">A collaborative canvas for brainstorming and visualizing ideas would be here.</p>
      <div className="w-full h-64 mt-4 bg-white/10 rounded-lg flex items-center justify-center text-white/50">
        <p>Canvas Area</p>
      </div>
    </div>
  );
};

export default WhiteboardModule;
