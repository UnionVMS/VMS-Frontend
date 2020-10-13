import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap, map, flatMap, withLatestFrom, catchError, filter } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';
import { NotificationsActions } from '@data/notifications';

import { MapSettingsSelectors, MapSettingsTypes, MapSettingsActions } from './';
import { MapSettingsService } from '@data/map-settings/map-settings.service';
import { UserSettingsService } from '@data/user-settings/user-settings.service';

import { apiErrorHandler } from '@app/helpers/api-error-handler';

@Injectable()
export class MapSettingsEffects {

  private readonly apiErrorHandler: (response: any, index: number) => boolean;

  constructor(
    private readonly actions$: Actions,
    private readonly userSettingsService: UserSettingsService,
    private readonly mapSettingsService: MapSettingsService,
    private readonly store$: Store<State>
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store$);
  }

  @Effect()
  saveMapSettingsObserver$ = this.actions$.pipe(
    ofType(MapSettingsActions.saveSettings),
    withLatestFrom(this.store$.select(AuthSelectors.getUser)),
    mergeMap(([action, user]: Array<any>) => {
      return this.userSettingsService.saveMapSettings(user, action.settings).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-map-settings-saved:Settings saved`),
          MapSettingsActions.replaceSettings({ settings: action.settings })
        ]),
        flatMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

  @Effect()
  getMovementSourcesObserver$ = this.actions$.pipe(
    ofType(MapSettingsActions.getMovementSources),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.mapSettingsService.getMovementSources(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((sources: any, index: number) =>
          MapSettingsActions.setMovementSources({ movementSources: sources })
        ),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
