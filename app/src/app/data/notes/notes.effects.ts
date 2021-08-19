import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, withLatestFrom, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';
import { NotesActions, NotesTypes } from './';
import { NotesService } from './notes.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import {  AuthSelectors } from '../auth';
import { AssetSelectors } from '../asset';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class NotesEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly notesService: NotesService,
    private readonly router: Router
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  getNotesForSelectedAssetObserver$ = createEffect(() => this.actions$.pipe(
    ofType(NotesActions.getNotesForSelectedAsset),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.assetId !== 'undefined') {
          return this.notesService.getNotesFromAssetId(authToken, mergedRoute.params.assetId).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
            map((response: any) => {
              return NotesActions.setNotes({
                notes: response
              });
            })
          );
        } else {
          return EMPTY;
        }
      })
    ))
  ));

  getSelectedNote$ = createEffect(() => this.actions$.pipe(
    ofType(NotesActions.getSelectedNote),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.noteId !== 'undefined') {
          return this.notesService.getNoteById(authToken, mergedRoute.params.noteId).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
            map((note: any) => {
              return NotesActions.setNotes({
                notes: { [note.id]: note }
              });
            })
          );
        } else {
          return EMPTY;
        }
      })
    ))
  ));

  deleteNote$ = createEffect(() => this.actions$.pipe(
    ofType(NotesActions.deleteNote),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.notesService.deleteNote(authToken, action.noteId).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((note: any) => {
            return NotesActions.removeNoteFromStore({ noteId: action.noteId });
          })
        );
      })
    ))
  ));

  saveNote$ = createEffect(() => this.actions$.pipe(
    ofType(NotesActions.saveNote),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(AssetSelectors.getAssetByUrl)
      ),
      mergeMap(([pipedAction, authToken, selectedAsset]: Array<any>) => {
        const isNew = pipedAction.note.id === undefined || pipedAction.note.id === null;
        let request: Observable<object>;
        if(isNew) {
          if(typeof pipedAction.note.assetId === 'undefined' && typeof selectedAsset !== 'undefined') {
            request = this.notesService.createNote(authToken, { ...pipedAction.note, assetId: selectedAsset.id });
          } else {
            request = this.notesService.createNote(authToken, { ...pipedAction.note, assetId: pipedAction.note.assetId });
          }
        } else {
          request = this.notesService.updateNote(authToken, action.note as NotesTypes.Note);
        }
        return request.pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((note: any) => {
            let notification = $localize`:@@ts-notes-updated:Notes updated successfully!`;
            if(pipedAction.redirect) {
              this.router.navigate(['/asset/' + note.assetId + '/notes']);
            }
            if(isNew) {
              notification = $localize`:@@ts-notes-created:Note created successfully!`;
            }
            return [NotesActions.setNotes({ notes: { [note.id]: note } }), NotificationsActions.addSuccess(notification)];
          })
        );
      }),
      mergeMap((rAction, index) => rAction)
    ))
  ));

}
