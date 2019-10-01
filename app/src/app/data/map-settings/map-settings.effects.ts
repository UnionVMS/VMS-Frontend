import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap, map, withLatestFrom, catchError } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';

import { MapSettingsSelectors, MapSettingsInterfaces, MapSettingsActions, MapSettingsService } from './';

@Injectable()
export class MapSettingsEffects {
  constructor(
    private actions$: Actions,
    private mapSettingsService: MapSettingsService,
    private store$: Store<State>
  ) {}

  @Effect()
  saveMapSettingsObserver$ = this.actions$.pipe(
    ofType(MapSettingsActions.saveSettings),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.mapSettingsService.saveMapSettings(authToken, action.settings).pipe(
        map((response: any, index: number) => MapSettingsActions.replaceSettings({ settings: action.settings })),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
