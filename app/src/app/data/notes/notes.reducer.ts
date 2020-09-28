import { createReducer, on } from '@ngrx/store';
import * as NotesActions from './notes.actions';
import * as NotesTypes from './notes.types';

export const initialState: NotesTypes.State = {
  notes: {}
};

export const notesReducer = createReducer(initialState,
  on(NotesActions.setNotes, (state, { notes }) => {
    return ({
      ...state,
      notes: {
        ...state.notes,
        ...notes
      }
    });
  }),
  on(NotesActions.removeNoteFromStore, (state, { noteId }) => {
    return ({
      ...state,
      notes: Object.values(state.notes).reduce((notes, note) => {
        if(note.id !== noteId) {
          return { ...notes, [note.id]: note };
        }
        return notes;
      }, {})
    });
  })
);
