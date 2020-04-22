import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { MergedRouteReducerState, MergedRoute } from './router.types';
import { routerStateConfig } from '@modules/router/ngrx-router.module';
import { State } from '@app/app-reducer';

// export const getRouterReducerState = createFeatureSelector<MergedRouteReducerState>(routerStateConfig.stateKey);
export const getRouterReducerState = (state: State) => state[routerStateConfig.stateKey];
export const getMergedRoute = createSelector(getRouterReducerState, (routerReducerState) => {
  return typeof routerReducerState !== 'undefined' ? routerReducerState.state : {} as MergedRoute;
});
