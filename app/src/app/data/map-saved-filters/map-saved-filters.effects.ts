import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap, map, withLatestFrom, catchError } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';

import { NotificationsActions } from '../notifications';
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
    ofType(MapSavedFiltersActions.addSavedFilter),
    withLatestFrom(
      this.store$.select(AuthSelectors.getAuthToken),
      this.store$.select(MapSavedFiltersSelectors.getSavedFilters)
    ),
    mergeMap(([action, authToken, savedFilters]: Array<any>, index: number) => {
      let filtersToSave = { ...savedFilters };
      if(typeof savedFilters[action.filter.name] === 'undefined') {
        filtersToSave = { ...filtersToSave, [action.filter.name]: action.filter.filter };
      }
      return this.userSettingsService.saveMapFilters(authToken, filtersToSave).pipe(
        map((response: any) => {
          return NotificationsActions.addSuccess(`Filter '${action.filter.name}' saved!`);
        }),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
