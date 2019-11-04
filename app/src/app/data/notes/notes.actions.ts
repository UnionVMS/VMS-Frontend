import { createAction, props } from '@ngrx/store';
import * as NotesInterfaces from './notes.interfaces';

export const getNotesForSelectedAsset = createAction(
  '[Notes] Get notes from asset id'
);

export const setNotes = createAction(
  '[Notes] Set notes',
  props<{ notes: { [id: string]: NotesInterfaces.Note } }>()
);

export const saveNote = createAction(
  '[Notes] Save note',
  props<{ note: NotesInterfaces.Note }>()
);

export const getSelectedNote = createAction(
  '[Notes] Get selected note'

);
