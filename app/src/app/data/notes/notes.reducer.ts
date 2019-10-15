import { createReducer, on } from '@ngrx/store';
import * as NotesActions from './notes.actions';
import * as NotesInterfaces from './notes.interfaces';

export const initialState: NotesInterfaces.State = {
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
  })
);
