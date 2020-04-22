import { createAction, props } from '@ngrx/store';
import * as NotesInterfaces from './notes.types';

export const getNotesForSelectedAsset = createAction(
  '[Notes] Get notes from asset id'
);

export const setNotes = createAction(
  '[Notes] Set notes',
  props<{ notes: { [id: string]: NotesInterfaces.Note } }>()
);

export const saveNote = createAction(
  '[Notes] Save note',
  props<{ note: NotesInterfaces.Note, redirect?: boolean }>()
);

export const getSelectedNote = createAction(
  '[Notes] Get selected note'
);
