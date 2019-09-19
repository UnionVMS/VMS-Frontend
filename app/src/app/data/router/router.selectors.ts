import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { MergedRouteReducerState, MergedRoute } from './router.interfaces';
import { routerStateConfig } from '@modules/router/ngrx-router.module';

export const getRouterReducerState = createFeatureSelector<MergedRouteReducerState>(routerStateConfig.stateKey);
export const getMergedRoute = createSelector(getRouterReducerState, (routerReducerState) => {
  return typeof routerReducerState !== 'undefined' ? routerReducerState.state : {} as MergedRoute;
});
