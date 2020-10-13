import { RouterStateSerializer } from '@ngrx/router-store';
import { ActivatedRouteSnapshot, Data, Params, RouterStateSnapshot } from '@angular/router';
import { MergedRoute } from './router.types';
import { Injectable } from '@angular/core';


@Injectable()
export class MergedRouterStateSerializer implements RouterStateSerializer<MergedRoute> {
  serialize(routerState: RouterStateSnapshot): MergedRoute {
    return {
      url: routerState.url,
      params: mergeRouteParams(routerState.root, r => r.params),
      queryParams: mergeRouteParams(routerState.root, r => r.queryParams),
      data: mergeRouteData(routerState.root)
    };
  }
}

const mergeRouteParams = (route: ActivatedRouteSnapshot, getter: (r: ActivatedRouteSnapshot) => Params): Params => {
  if (!route) {
    return {};
  }
  const currentParams = getter(route);
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return {...currentParams, ...mergeRouteParams(primaryChild, getter)};
};

const mergeRouteData = (route: ActivatedRouteSnapshot): Data => {
  if (!route) {
    return {};
  }

  const currentData = route.data;
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return {...currentData, ...mergeRouteData(primaryChild)};
};
