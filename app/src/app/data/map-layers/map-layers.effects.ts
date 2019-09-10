import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, merge, Observable } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter } from 'rxjs/operators';

import { AuthInterfaces, AuthSelectors } from '../auth';

import { MapLayersService } from './map-layers.service';
import { MapLayersActions } from './';

@Injectable()
export class MapLayersEffects {
  constructor(
    private actions$: Actions,
    private mapLayersService: MapLayersService,
    private store$: Store<AuthInterfaces.State>
  ) {}

  @Effect()
  getAreas$ = this.actions$.pipe(
    ofType(MapLayersActions.getAreas),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.mapLayersService.getAreas(authToken).pipe(
        map((response: any) => MapLayersActions.setAreas({ mapLayers: response }))
      );
    })
  );
}
