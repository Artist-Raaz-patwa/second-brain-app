import React, { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';

const NotesModule: React.FC = () => {
  const { notes, addNote, deleteNote, updateNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    // If there's no active note or the active note was deleted, select the first one.
    if (!activeNoteId || !notes.some(n => n.id === activeNoteId)) {
      setActiveNoteId(notes.length > 0 ? notes[0].id : null);
    }
  }, [notes, activeNoteId]);

  const handleNewNote = () => {
    const newNote = addNote({ title: 'New Note', content: '' });
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (noteIdToDelete: string) => {
    deleteNote(noteIdToDelete);
    // Active note logic is handled by the useEffect
  };

  const handleNoteUpdate = (id: string, updatedFields: { title?: string; content?: string }) => {
    updateNote(id, updatedFields);
  };

  const activeNote = notes.find(note => note.id === activeNoteId);

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      <div className="w-full md:w-1/3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg flex flex-col h-64 md:h-auto">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0 flex justify-between items-center">
          <h3 className="text-lg font-semibold tracking-tight">All Notes</h3>
          <button
            onClick={handleNewNote}
            className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
            aria-label="Create new note"
          >
            + New
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {notes.length > 0 ? (
            <ul>
              {notes.map(note => (
                <li key={note.id}>
                  <button
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      activeNoteId === note.id ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <h4 className="font-semibold text-black dark:text-white truncate">{note.title || 'Untitled Note'}</h4>
                    <p className="text-sm text-gray-500 dark:text-white/50 truncate mt-1">{note.content || 'No additional content'}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-8 text-gray-400 dark:text-white/40">
              <p>No notes yet.</p>
              <p>Click "+ New" to start.</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg flex flex-col flex-1">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-between gap-4">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => handleNoteUpdate(activeNote.id, { title: e.target.value })}
                placeholder="Note Title"
                className="text-xl font-bold bg-transparent focus:outline-none w-full text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
                aria-label="Note title"
              />
              <button 
                onClick={() => handleDeleteNote(activeNote.id)}
                className="text-gray-400 dark:text-white/50 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label="Delete note"
                title="Delete note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            <textarea
              value={activeNote.content}
              onChange={e => handleNoteUpdate(activeNote.id, { content: e.target.value })}
              placeholder="Start writing..."
              className="w-full flex-1 bg-white dark:bg-black p-4 text-gray-800 dark:text-white/90 resize-none focus:outline-none leading-relaxed"
              aria-label="Note content"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-gray-400 dark:text-white/40">
            <div>
              <p>Select a note to get started</p>
              <p>or create a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModule;