import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, merge, Observable } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';

import { AuthTypes, AuthSelectors } from '../auth';

import { MapLayersService } from './map-layers.service';
import { MapLayersActions } from './';

import { apiErrorHandler } from '@app/helpers/api-error-handler';

@Injectable()
export class MapLayersEffects {

  private readonly apiErrorHandler: (response: any, index: number) => boolean;

  constructor(
    private readonly actions$: Actions,
    private readonly mapLayersService: MapLayersService,
    private readonly store$: Store<AuthTypes.State>
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store$);
  }

  @Effect()
  getAreas$ = this.actions$.pipe(
    ofType(MapLayersActions.getAreas),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.mapLayersService.getAreas(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response: any) => MapLayersActions.addAreas({ mapLayers: response }))
      );
    })
  );

  @Effect()
  getUserAreas$ = this.actions$.pipe(
    ofType(MapLayersActions.getUserAreas),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(AuthSelectors.getUser),
      ),
      mergeMap(([action, authToken, user]: Array<any>) => {
        return this.mapLayersService.getUserAreas(authToken, user.scope.name, user.role.name).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response: any) =>
            MapLayersActions.addAreas({ mapLayers: response.distinctAreaGroups.map((userLayerName: string) => (
              {
                areaTypeDesc: `${response.areaTypeDesc}: ${userLayerName}`,
                geoName: 'uvms:userareas',
                serviceType: 'WMS',
                style: 'userareas_label_geom',
                typeName: `${response.typeName}-${userLayerName}`,
                cqlFilter: `area_group='${userLayerName}'`
              }
            ))
          }))
        );
      })
    ))
  );
}
