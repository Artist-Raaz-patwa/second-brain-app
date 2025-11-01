import React, { useState } from 'react';
import WidgetWrapper from './WidgetWrapper';
import { useNotes } from '../../hooks/useNotes';

const QuickNoteWidget: React.FC = () => {
    const [content, setContent] = useState('');
    const { addNote } = useNotes();

    const handleAddNote = () => {
        if (!content.trim()) return;
        const firstLine = content.split('\n')[0];
        addNote({
            title: firstLine.substring(0, 30) + (firstLine.length > 30 ? '...' : ''),
            content: content,
        });
        setContent('');
    };
    
    return (
        <WidgetWrapper title="Quick Note">
            <div className="flex flex-col h-full">
                 <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Jot something down..."
                    className="w-full flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 resize-none focus:outline-none leading-relaxed"
                />
                <button
                    onClick={handleAddNote}
                    disabled={!content.trim()}
                    className="w-full mt-2 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                    Save Note
                </button>
            </div>
        </WidgetWrapper>
    );
};

export default QuickNoteWidget;