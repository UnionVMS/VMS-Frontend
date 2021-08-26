import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, withLatestFrom, filter } from 'rxjs/operators';

import { State } from '@app/app-reducer';

import { AuthSelectors } from '../auth';

import { MapLayersService } from './map-layers.service';
import { MapLayersActions, MapLayersTypes } from './';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

import WMSCapabilities from 'ol/format/WMSCapabilities';

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

  getAreas$ = createEffect(() => this.actions$.pipe(
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
  ));

  getUserAreas$ = createEffect(() => this.actions$.pipe(
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
  ));

  getCascadedLayers$ = createEffect(() => this.actions$.pipe(
    ofType(MapLayersActions.getCascadedLayers),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([_, authToken]: Array<any>) => {
      return this.mapLayersService.getWMSCapabilities(authToken).pipe(
        map((response) => { return new WMSCapabilities().read(response).Capability.Layer.Layer }),
        map((layers: any) => MapLayersActions.addCascadedLayers({
          cascadedLayers: layers.reduce((acc, layer) => {
            if (layer.cascaded === 1) {
              acc[layer.Name] = { name: layer.Name, title: layer.Title, abstract: layer.Abstract };
            }
            return acc;
          }, {})
        }))
      );
    })
  ));
}
