import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';

export const getRouterState = createFeatureSelector('router');

export const getActivatedRoute = createSelector(
  getRouterState,
  (routerState: any) => {
    if (typeof routerState !== 'undefined') {
      return routerState.state;
    }
  }
);

export const getRouterData = createSelector(
  getActivatedRoute,
  (activatedRoute: ActivatedRoute) => {
    if (typeof activatedRoute !== 'undefined' && typeof activatedRoute.root.firstChild !== 'undefined') {
      return activatedRoute.root.firstChild.data;
    }
    return {};
  }
);
