import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, merge, Observable } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';

import { AuthTypes, AuthSelectors } from '../auth';

import { MapLayersService } from './map-layers.service';
import { MapLayersActions, MapLayersTypes } from './';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class MapLayersEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly mapLayersService: MapLayersService,
    private readonly store: Store<State>
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  @Effect()
  getAreas$ = this.actions$.pipe(
    ofType(MapLayersActions.getAreas),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.mapLayersService.getAreas(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((mapLayers: ReadonlyArray<MapLayersTypes.MapLayer>) => MapLayersActions.addAreas({
          mapLayers: mapLayers.reduce((acc, layer) => {
            acc[layer.typeName] = layer;
            return acc;
          }, {})
        }))
      );
    })
  );

  @Effect()
  getUserAreas$ = this.actions$.pipe(
    ofType(MapLayersActions.getUserAreas),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(AuthSelectors.getUser),
      ),
      mergeMap(([action, authToken, user]: Array<any>) => {
        return this.mapLayersService.getUserAreas(authToken, user.scope.name, user.role.name).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((response: any) =>
            MapLayersActions.addAreas({ mapLayers: response.distinctAreaGroups.reduce((acc, userLayerName: string) => {
              acc[`${response.typeName}-${userLayerName}`] = {
                areaTypeDesc: `${response.areaTypeDesc}: ${userLayerName}`,
                geoName: 'uvms:userareas',
                serviceType: 'WMS',
                style: 'userareas_label_geom',
                typeName: `${response.typeName}-${userLayerName}`,
                cqlFilter: `area_group='${userLayerName}'`
              };
              return acc;
            }, {})
          }))
        );
      })
    ))
  );
}
