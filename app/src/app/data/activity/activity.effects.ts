import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { State } from '@app/app-reducer';
import { AuthSelectors } from '../auth';
import { ActivityService } from './activity.service';
import { ActivityActions } from './';
import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';
import { EMPTY } from 'rxjs';
import moment from 'moment-timezone';

@Injectable()
export class ActivityEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly activityService: ActivityService,
    private readonly store: Store<State>,
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  getActivitiesObserver$ = createEffect(() => this.actions$.pipe(
    ofType(ActivityActions.getInitialActivities),
    withLatestFrom(
      this.store.select(AuthSelectors.getAuthToken),
      this.store.select(AuthSelectors.getUser),
      this.store.select(AuthSelectors.hasActivityFeature)
      ),
    mergeMap(([action, authToken, user, hasActivityFeature]: Array<any>) => {
      if (!hasActivityFeature) {
        return EMPTY;
      }
      const startDate = moment().utc().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss');
      return this.activityService.getActivities(null, startDate, authToken, user.scope.name, user.role.name).pipe(
        //map((response) => { this.apiUpdateTokenHandler(response); return response; }),
        map((response: any) => {
          return ActivityActions.addActivities({
            activities: response.resultList.reduce((acc, activity) => {
              if (typeof acc[activity.vesselId] === 'undefined'
                || activity.startDate >= acc[activity.vesselId].startDate)
              {
                acc[activity.vesselId] = activity;
              }
              return acc;
            }, {})
          });
        })
      );
    })
  ));

  getActivityTrackObserver$ = createEffect(() => this.actions$.pipe(
    ofType(ActivityActions.getActivityTrack),
    withLatestFrom(
      this.store.select(AuthSelectors.getAuthToken),
      this.store.select(AuthSelectors.getUser),
      this.store.select(AuthSelectors.hasActivityFeature)
      ),
    mergeMap(([action, authToken, user, hasActivityFeature]: Array<any>) => {
      if (!hasActivityFeature) {
        return EMPTY;
      }
      const startDate = moment(action.startDate).utc().format('YYYY-MM-DDTHH:mm:ss');
      return this.activityService.getActivities(action.assetId, startDate, authToken, user.scope.name, user.role.name).pipe(
        //map((response) => { this.apiUpdateTokenHandler(response); return response; }),
        map((response: any) => {
          return ActivityActions.addActivityTrack({
            assetId: action.assetId,
            activities: response.resultList
          });
        })
      );
    })
  ));
}
