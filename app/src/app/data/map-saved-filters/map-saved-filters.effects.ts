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

import { replaceDontTranslate } from '@app/helpers/helpers';

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
      this.store$.select(AuthSelectors.getUser),
      this.store$.select(MapSavedFiltersSelectors.getSavedFilters)
    ),
    mergeMap(([action, user, savedFilters]: Array<any>, index: number) => {
      let filtersToSave = { ...savedFilters };
      if(typeof savedFilters[action.filter.name] === 'undefined') {
        filtersToSave = { ...filtersToSave, [action.filter.name]: action.filter.filter };
      }
      return this.userSettingsService.saveMapFilters(user, filtersToSave).pipe(
        map((response: any) => {
          const message = $localize`:@@ts-savedfilters-saved:Filter '<dont-translate>filterName</dont-translate>' saved!`;
          return NotificationsActions.addSuccess(replaceDontTranslate(message, { filterName: action.filter.name }));
        }),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
