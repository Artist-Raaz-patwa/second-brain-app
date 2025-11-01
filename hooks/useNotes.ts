import { useLocalStorage } from './useLocalStorage';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('secondbrain-notes', []);

  const addNote = (newNoteData: { title: string; content: string }): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      ...newNoteData,
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    return newNote;
  };

  const deleteNote = (noteIdToDelete: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteIdToDelete));
  };

  const updateNote = (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updatedFields } : note
      )
    );
  };

  return { notes, addNote, deleteNote, updateNote };
};
