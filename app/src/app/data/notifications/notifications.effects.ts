import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { NotificationsActions, NotificationsTypes } from './';

@Injectable()
export class NotificationEffects {
  constructor( private readonly actions$: Actions, private readonly store: Store<State>) {}

  autoDismissNotificaitons$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.addNotification),
    mergeMap((action) => {
      if(typeof action.autoDismissInMs !== 'undefined') {
        return of(NotificationsActions.dismiss({ notificationType: action.notificationType, id: action.id }))
          .pipe(delay(action.autoDismissInMs));
      }
      return EMPTY;
    }
  )));
}
