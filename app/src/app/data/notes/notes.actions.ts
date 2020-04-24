import { createAction, props } from '@ngrx/store';
import * as NotesTypes from './notes.types';

export const getNotesForSelectedAsset = createAction(
  '[Notes] Get notes from asset id'
);

export const setNotes = createAction(
  '[Notes] Set notes',
  props<{ notes: { [id: string]: NotesTypes.Note } }>()
);

export const saveNote = createAction(
  '[Notes] Save note',
  props<{ note: NotesTypes.Note, redirect?: boolean }>()
);

export const getSelectedNote = createAction(
  '[Notes] Get selected note'
);
