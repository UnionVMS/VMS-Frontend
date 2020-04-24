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
  })
);
