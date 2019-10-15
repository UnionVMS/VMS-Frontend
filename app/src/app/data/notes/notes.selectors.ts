import { createSelector } from '@ngrx/store';
import * as NotesInterfaces from './notes.interfaces';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectNotes = (state: State) => state.notes.notes;

export const getNotes= createSelector(
  selectNotes,
  (notes: { [id: string ]: NotesInterfaces.Note }) => {
    return Object.values(notes).map((note) => ({ ...note }));
  }
);

export const getNoteByUrl = createSelector(
  selectNotes,
  getMergedRoute,
  (notes, mergedRoute) => {
    if(typeof notes[mergedRoute.params.noteId] !== 'undefined') {
      const note = notes[mergedRoute.params.noteId];
      return { ...note };
    }
    return undefined;
  }
);
