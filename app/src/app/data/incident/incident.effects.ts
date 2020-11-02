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
import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class IncidentEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly incidentService: IncidentService,
    private readonly store: Store<State>,
    private readonly router: Router
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }


  @Effect()
  createNote$ = this.actions$.pipe(
    ofType(IncidentActions.createNote),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken, selectedAsset]: Array<any>) => {
        return this.incidentService.createNote(authToken, action.incidentId, pipedAction.note).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
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
  getAllOpenIncidents$ = this.actions$.pipe(
    ofType(IncidentActions.getAllOpenIncidents),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getAllOpenIncidents(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((
          incidents: {
            unresolved: ReadonlyArray<IncidentTypes.Incident>,
            recentlyResolved: ReadonlyArray<IncidentTypes.Incident>,
         }
        ) => {
          return [
            IncidentActions.setIncidents({ incidents: {
              unresolvedIncidents: incidents.unresolved,
              recentlyResolvedIncidents: incidents.recentlyResolved
            }}),
            AssetActions.checkForAssetEssentials({
              assetIds: [ ...new Set([
                ...Object.values(incidents.unresolved).map((incident) => incident.assetId),
                ...Object.values(incidents.recentlyResolved).map((incident) => incident.assetId)
              ]) ]
            })
          ];
        }),
        flatMap(a => a),
      );
    })
  );

  @Effect()
  getIncidentsForAssetId$ = this.actions$.pipe(
    ofType(IncidentActions.getIncidentsForAssetId),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getIncidentsForAssetId(authToken, action.assetId, action.onlyOpen).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((incidents: Readonly<{ [incidentId: string]: IncidentTypes.Incident }>) => {
          return IncidentActions.setIncidentListForAsset({
            assetId: action.assetId,
            incidents
          });
        })
      );
    }),
  );

  @Effect()
  getIncidentTypes$ = this.actions$.pipe(
    ofType(IncidentActions.getIncidentTypes),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getIncidentTypes(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((incidentTypes: IncidentTypes.IncidentTypesCollection) => {
          return IncidentActions.setIncidentTypes({ incidentTypes });
        })
      );
    }),
  );

  @Effect()
  getValidIncidentStatusForTypes$ = this.actions$.pipe(
    ofType(IncidentActions.getValidIncidentStatusForTypes),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getValidIncidentStatusForTypes(authToken).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((validIncidentStatusForType) => {
          return IncidentActions.setValidIncidentStatusForTypes();
        })
      );
    }),
  );

  @Effect()
  updateIncidentType$ = this.actions$.pipe(
    ofType(IncidentActions.updateIncidentType),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.updateIncidentType(authToken, action.incidentId, action.incidentType, action.expiryDate).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((incident: IncidentTypes.Incident) => IncidentActions.updateIncidents({ incidents: { [incident.id]: incident } }))
      );
    }),
  );

  @Effect()
  updateIncidentStatus$ = this.actions$.pipe(
    ofType(IncidentActions.updateIncidentStatus),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.updateIncidentStatus(authToken, action.incidentId, action.status, action.expiryDate).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((incident: IncidentTypes.Incident) => IncidentActions.updateIncidents({ incidents: { [incident.id]: incident } }))
      );
    }),
  );

  @Effect()
  updateIncidentExpiry$ = this.actions$.pipe(
    ofType(IncidentActions.updateIncidentExpiry),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.updateIncidentExpiry(authToken, action.incidentId, action.expiryDate).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((incident: IncidentTypes.Incident) => IncidentActions.updateIncidents({ incidents: { [incident.id]: incident } }))
      );
    }),
  );

  @Effect()
  pollIncident$ = this.actions$.pipe(
    ofType(IncidentActions.pollIncident),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(AuthSelectors.getUserName)
      ),
      mergeMap(([action, authToken, userName]: Array<any>) => {
        return this.incidentService.poll(authToken, action.incidentId, action.comment).pipe(
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          mergeMap((response: any) => {
            if(typeof response.code !== 'undefined') {
              return [NotificationsActions.addError('Server error: Couldn\'t create a manual poll. Please contact system administrator.')];
            }
            return [NotificationsActions.addNotice('Manual poll initiated. Response can take anywhere from a few minutes up to a couple of hours.')];
          })
        );
      })
    ))
  );

  @Effect()
  getLogForIncident$ = this.actions$.pipe(
    ofType(IncidentActions.getLogForIncident),
    withLatestFrom(this.store.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]: Array<any>) => {
      return this.incidentService.getLogForIncident(authToken, action.incidentId).pipe(
        filter((response: any, index: number) => this.apiErrorHandler(response, index)),
        map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
        map((response: any) => {
          const log: { readonly [logEntryId: number]: IncidentTypes.IncidentLogEntry } = Object.values(response.incidentLogs).reduce(
            (acc: { readonly [logEntryId: number]: IncidentTypes.IncidentLogEntry }, incidentLog: IncidentTypes.IncidentLogEntry) => {
              const parsedLog =  typeof incidentLog.data !== 'undefined'
                ? { ...incidentLog, data: JSON.parse(incidentLog.data as string) }
                : incidentLog;
              return { ...acc,
                [incidentLog.id]: parsedLog
              };
            }, {}
          ) as { readonly [logEntryId: number]: IncidentTypes.IncidentLogEntry };

          return IncidentActions.setLogForIncident({
            incidentId: action.incidentId,
            incidentLog: {
              log,
              relatedObjects: response.relatedObjects
            }
          });
        })
      );
    }),
  );

}
