import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { NotificationsActions, NotificationsTypes } from './';

@Injectable()
export class NotificationEffects {
  constructor( private readonly actions$: Actions, private readonly store: Store<State>) {}

  @Effect()
  autoDismissNotificaitons$ = this.actions$.pipe(
    ofType(NotificationsActions.addNotification),
    mergeMap((action) => {
      if(typeof action.autoDismissInMs !== 'undefined') {
        return of(NotificationsActions.dismiss({ notificationType: action.notificationType, id: action.id }))
          .pipe(delay(action.autoDismissInMs));
      }
      return EMPTY;
    }
  ));
}
