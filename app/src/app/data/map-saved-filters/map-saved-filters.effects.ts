import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap, withLatestFrom, catchError } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';

import { MapSavedFiltersActions, MapSavedFiltersSelectors } from './';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class MapSavedFiltersEffects {
  constructor(
    private actions$: Actions,
    private userSettingsService: UserSettingsService,
    private store$: Store<State>
  ) {}

  @Effect()
  saveMapFiltersObserver$ = this.actions$.pipe(
    ofType(MapSavedFiltersActions.ActionTypes.AddSavedFilter),
    withLatestFrom(
      this.store$.select(AuthSelectors.getAuthToken),
      this.store$.select(MapSavedFiltersSelectors.getSavedFilters)
    ),
    mergeMap(([action, authToken, savedFilters]: Array<any>, index: number) => {
      let filtersToSave = { ...savedFilters };
      if(typeof savedFilters[action.payload.name] === 'undefined') {
        filtersToSave = { ...filtersToSave, [action.payload.name]: action.payload.filter };
      }
      // return EMPTY;
      return this.userSettingsService.saveMapFilters(authToken, filtersToSave).pipe(
        // @ts-ignore
        mergeMap((response: any) => {
          console.warn('Response: ', response);
          // return this.store$.dispatch(new MapSettingsActions.ReplaceSettings(action.payload));
        }),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
