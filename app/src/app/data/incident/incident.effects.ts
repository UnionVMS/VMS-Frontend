import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTER_NAVIGATED, RouterNavigationAction } from '@ngrx/router-store';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { of, EMPTY, merge, Observable, interval, Subject } from 'rxjs';
import { map, mergeMap, mergeAll, flatMap, catchError, withLatestFrom, bufferTime, filter, takeUntil } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AuthTypes, AuthSelectors } from '../auth';
import { AssetSelectors } from '@data/asset';
import { NotesActions } from '@data/notes';

import { MapSettingsSelectors } from '../map-settings';

import { IncidentService } from './incident.service';
import { IncidentActions, IncidentTypes } from './';
import { AssetTypes, AssetActions } from '@data/asset';
import * as RouterSelectors from '@data/router/router.selectors';
import * as NotificationsActions from '@data/notifications/notifications.actions';
import { MobileTerminalTypes, MobileTerminalActions } from '@data/mobile-terminal';

@Injectable()
export class IncidentEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly incidentService: IncidentService,
    private readonly store$: Store<State>,
    private readonly router: Router
  ) {}


  @Effect()
  createNote$ = this.actions$.pipe(
    ofType(IncidentActions.createNote),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken, selectedAsset]: Array<any>) => {
        return this.incidentService.createNote(authToken, action.incidentId, pipedAction.note).pipe(
          map((note: any) => {
            const notification = $localize`:@@ts-notes-created:Note created successfully!`;
            return [NotesActions.setNotes({ notes: { [note.id]: note } }), NotificationsActions.addSuccess(notification)];
          })
        );
      }),
      flatMap((rAction, index) => rAction)
    ))
  );

  @Effect()
  getAssetNotSendingIncidents$ = this.actions$.pipe(
    ofType(IncidentActions.getAssetNotSendingIncidents),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getAssetNotSendingEvents(authToken).pipe(
        map((assetNotSendingIncidents: ReadonlyArray<IncidentTypes.assetNotSendingIncident>) => {
          return [
            IncidentActions.setAssetNotSendingIncidents({
              assetNotSendingIncidents: assetNotSendingIncidents.reduce((acc, assetNotSendingIncident) => {
                acc[assetNotSendingIncident.assetId] = assetNotSendingIncident;
                return acc;
              }, {})
            }),
            AssetActions.checkForAssetEssentials({
              assetIds: assetNotSendingIncidents.map((incident) => incident.assetId)
            })
          ];
        }),
        flatMap(a => a),
      );
    })
  );

  @Effect()
  pollIncident$ = this.actions$.pipe(
    ofType(IncidentActions.pollIncident),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(AuthSelectors.getUserName)
      ),
      mergeMap(([action, authToken, userName]: Array<any>) => {
        return this.incidentService.poll(authToken, action.incidentId, action.comment).pipe(
          mergeMap((response: any) => {
            if(typeof response.code !== 'undefined') {
              return [NotificationsActions.addError('Server error: Couldn\'t create a manual poll. Please contact system administrator.')];
            }
            return [NotificationsActions.addSuccess('Manual poll initiated. Response can take anywhere from a few minutes up to a couple of hours.')];
          })
        );
      })
    ))
  );

  @Effect()
  saveNewIncidentStatus$ = this.actions$.pipe(
    ofType(IncidentActions.saveNewIncidentStatus),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.saveNewIncidentStatus(authToken, action.incidentId, action.status).pipe(
        map((asset: AssetTypes.Asset) => {
          return [NotificationsActions.addSuccess(
            $localize`:@@ts-incident-changed:Incident status successfully changed!`
          )];
        })
      );
    }),
    flatMap(a => a)
  );

  @Effect()
  getLogForIncident$ = this.actions$.pipe(
    ofType(IncidentActions.getLogForIncident),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getLogForIncident(authToken, action.incidentId).pipe(
        map((log: any) => {
          console.warn(log);
          return IncidentActions.setLogForIncident({
            incidentId: action.incidentId,
            incidentLog: {
              log: log.incidentLogs,
              relatedObjects: log.relatedObjects
            }
          });
        })
      );
    }),
  );

}
