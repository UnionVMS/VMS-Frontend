import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer.ts';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap, map, flatMap, withLatestFrom, catchError } from 'rxjs/operators';

import { AuthReducer, AuthSelectors } from '../auth';
import { NotificationsActions } from '@data/notifications';

import { MapSettingsSelectors, MapSettingsInterfaces, MapSettingsActions } from './';
import { UserSettingsService } from '@data/user-settings/user-settings.service';

@Injectable()
export class MapSettingsEffects {
  constructor(
    private actions$: Actions,
    private userSettingsService: UserSettingsService,
    private store$: Store<State>
  ) {}

  @Effect()
  saveMapSettingsObserver$ = this.actions$.pipe(
    ofType(MapSettingsActions.saveSettings),
    withLatestFrom(this.store$.select(AuthSelectors.getUser)),
    mergeMap(([action, user]: Array<any>) => {
      return this.userSettingsService.saveMapSettings(user, action.settings).pipe(
        map((response: any, index: number) => [
          NotificationsActions.addSuccess($localize`:@@ts-map-settings-saved:Settings saved`),
          MapSettingsActions.replaceSettings({ settings: action.settings })
        ]),
        flatMap(a => a),
        catchError((err) => of({ type: 'API ERROR', payload: err }))
      );
    })
  );

}
