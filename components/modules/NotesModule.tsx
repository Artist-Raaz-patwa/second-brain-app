import React, { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { GoogleGenAI } from '@google/genai';

const NotesModule: React.FC = () => {
  const { notes, addNote, deleteNote, updateNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const handleAiAction = async (action: 'summarize' | 'improve') => {
    if (!activeNote || !activeNote.content.trim() || isAiLoading || !process.env.API_KEY) return;

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = action === 'summarize' 
        ? `Summarize the following text concisely:\n\n"${activeNote.content}"`
        : `Improve the writing of the following text (fix grammar, make it clearer, and more concise) and only return the improved text:\n\n"${activeNote.content}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      updateNote(activeNote.id, { content: response.text });
    } catch (error) {
      console.error("AI Action Error:", error);
      alert("An error occurred while using the AI feature. Please check the console for details.");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const AiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 13a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M19.5 13a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M12 22a2.5 2.5 0 0 1-2.5-2.5V18h5v1.5A2.5 2.5 0 0 1 12 22Z"/><path d="M12 2a2.5 2.5 0 0 1 2.5 2.5V6h-5V4.5A2.5 2.5 0 0 1 12 2Z"/><path d="M18 12a2.5 2.5 0 0 1 0-5V4.5a2.5 2.5 0 0 0-5 0V6"/><path d="M6 12a2.5 2.5 0 0 0 0 5v2.5a2.5 2.5 0 0 0 5 0V18"/></svg>;
  const LoadingSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>;


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
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-between gap-2">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => handleNoteUpdate(activeNote.id, { title: e.target.value })}
                placeholder="Note Title"
                className="text-xl font-bold bg-transparent focus:outline-none w-full text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
                aria-label="Note title"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
                  <button onClick={() => handleAiAction('summarize')} disabled={isAiLoading || !activeNote.content.trim()} className="flex items-center gap-1 px-2 py-1 text-xs text-black dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Summarize Note">
                    {isAiLoading ? <LoadingSpinner /> : <AiIcon />} Summarize
                  </button>
                   <button onClick={() => handleAiAction('improve')} disabled={isAiLoading || !activeNote.content.trim()} className="flex items-center gap-1 px-2 py-1 text-xs text-black dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Improve Writing">
                    {isAiLoading ? <LoadingSpinner /> : <AiIcon />} Improve
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteNote(activeNote.id)}
                  className="text-gray-400 dark:text-white/50 hover:text-red-500 transition-colors"
                  aria-label="Delete note"
                  title="Delete note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
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