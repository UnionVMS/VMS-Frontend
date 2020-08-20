import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { FishingReportActions, FishingReportTypes, FishingReportSelectors } from './';
import { FishingReportService } from './fishing-report.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthTypes, AuthSelectors } from '../auth';
import * as RouterSelectors from '@data/router/router.selectors';

import { hashCode } from '@app/helpers/helpers';

@Injectable()
export class FishingReportEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<State>,
    private readonly fishingReportService: FishingReportService,
    private readonly router: Router
  ) {}

  @Effect()
  search$ = this.actions$.pipe(
    ofType(FishingReportActions.search),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]) => {
      return this.fishingReportService.search(authToken, action.query).pipe(
        map((response: Readonly<{
          fishingReports: FishingReportTypes.FishingReports,
          priorNotifications: FishingReportTypes.PriorNotifications
        }> ) => {
          console.warn(response);
          return [
            FishingReportActions.addFishingReports({ fishingReports: response.fishingReports }),
            FishingReportActions.addPriorNotifications({ priorNotifications: response.priorNotifications }),
            FishingReportActions.addFishingReportSearchResult({
              searchId: 'sid-' + hashCode(JSON.stringify(action.query)),
              fishingReportIds: Object.keys(response.fishingReports),
              isUserSearch: action.isUserSearch === true
            })
          ];
          return EMPTY;
          // const result = [
          //   FishingReportActions.addMobileTerminals({
          //     mobileTerminals: response.fishingReportList.reduce((acc, mobileTerminal) => {
          //       acc[mobileTerminal.id] = mobileTerminal;
          //       return acc;
          //     }, {})
          //   })
          // ];
          //
          // if(action.saveAsSearchResult === true) {
          //   return [
          //     ...result,
          //     FishingReportActions.addSearchResult({
          //       uniqueHash: hashCode(JSON.stringify(action.query) + action.includeArchived ? 't' : 'f'),
          //       mobileTerminalIds: response.fishingReportList.map(mobileTerminal => mobileTerminal.id)
          //     })
          //   ];
          // } else {
          //   return result;
          // }
        }),
        flatMap((rAction, index) => rAction),
        catchError((err) => {
          if(typeof err === 'object' && typeof err.message !== 'undefined') {
            return of(NotificationsActions.addError(err.message));
          }
          return of(NotificationsActions.addError(err.toString()));
        })
      );
    })
  );

}
