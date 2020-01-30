import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AssetSelectors } from '../asset';
import { MobileTerminalActions, MobileTerminalInterfaces, MobileTerminalSelectors } from './';
import { MobileTerminalService } from './mobile-terminal.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthInterfaces, AuthSelectors } from '../auth';
import * as RouterSelectors from '@data/router/router.selectors';

@Injectable()
export class MobileTerminalEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<State>,
    private mobileTerminalService: MobileTerminalService,
    private router: Router
  ) {}

  @Effect()
  search$ = this.actions$.pipe(
    ofType(MobileTerminalActions.search),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]) => {
      return this.mobileTerminalService.search(authToken, action.query, action.includeArchived).pipe(
        map((response: { mobileTerminalList: Array<MobileTerminalInterfaces.MobileTerminal> }) => {
          return MobileTerminalActions.addMobileTerminals({
            mobileTerminals: response.mobileTerminalList.reduce((acc, mobileTerminal) => {
              acc[mobileTerminal.id] = mobileTerminal;
              return acc;
            }, {})
          });
        }),
        catchError((err) => {
          if(typeof err === 'object' && typeof err.message !== 'undefined') {
            return of(NotificationsActions.addError(err.message));
          }
          return of(NotificationsActions.addError(err.toString()));
        })
      );
    })
  );

  @Effect()
  getSelectedMobileTerminal$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getSelectedMobileTerminal),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(MobileTerminalSelectors.getMobileTerminalsByUrl),
        this.store$.select(RouterSelectors.getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, selectedMobileTerminal, mergedRoute]: Array<any>) => {
        if(typeof selectedMobileTerminal !== 'undefined' || typeof mergedRoute.params.mobileTerminalId === 'undefined') {
          return EMPTY;
        }
        return this.mobileTerminalService.getMobileTerminal(authToken, mergedRoute.params.mobileTerminalId).pipe(
          map((mobileTerminal: MobileTerminalInterfaces.MobileTerminal) => {
            return MobileTerminalActions.setMobileTerminal({ mobileTerminal });
          })
        );
      })
    ))
  );

  @Effect()
  getTransponders$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getTransponders),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken]: Array<any>) => {
        return this.mobileTerminalService.getTransponders(authToken).pipe(
          map((response: any) => {
            return MobileTerminalActions.setTransponders({ transponders: response.data });
          })
        );
      })
    ))
  );

  @Effect()
  getPlugins$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getPlugins),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken]: Array<any>) => {
        return this.mobileTerminalService.getPlugins(authToken).pipe(
          map((response: any) => {
            return MobileTerminalActions.setPlugins({ plugins: response });
          })
        );
      })
    ))
  );

  @Effect()
  saveMobileTerminal$ = this.actions$.pipe(
    ofType(MobileTerminalActions.saveMobileTerminal),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(AssetSelectors.getSelectedAsset)
      ),
      mergeMap(([pipedAction, authToken, selectedAsset]: Array<any>) => {
        const isNew = action.mobileTerminal.id === undefined || action.mobileTerminal.id === null;
        let request: Observable<object>;
        if(isNew) {
          if(typeof action.mobileTerminal.assetId === 'undefined' && typeof selectedAsset !== 'undefined') {
            request = this.mobileTerminalService.createMobileTerminal(authToken, { ...action.mobileTerminal, assetId: selectedAsset.id });
          } else {
            request = this.mobileTerminalService.createMobileTerminal(authToken, action.mobileTerminal);
          }
        } else {
          request = this.mobileTerminalService.updateMobileTerminal(authToken, action.mobileTerminal);
        }
        return request.pipe(
          map((mobileTerminal: any) => {
            let notification = 'Mobile terminal updated successfully!';
            this.router.navigate(['/asset/' + mobileTerminal.assetId]);
            if(isNew) {
              notification = 'Asset created successfully!';
            }
            return [MobileTerminalActions.setMobileTerminal({ mobileTerminal }), NotificationsActions.addSuccess(notification)];
          })
        );
      }),
      flatMap((rAction, index) => rAction)
    ))
  );



  @Effect()
  checkIfSerialNumberExists$ = this.actions$.pipe(
    ofType(MobileTerminalActions.serialNumberExists),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken]: Array<any>) => {
        if(pipedAction.isSelf === true){
          return new Observable((observer) => {
            observer.next(MobileTerminalActions.setSerialNumberExists({ serialNumberExists: false }));
            observer.complete();
          });
        }
        return this.mobileTerminalService.serialNumberExists(authToken, pipedAction.serialNumber).pipe(
          map((response: any) => {
            return MobileTerminalActions.setSerialNumberExists({ serialNumberExists: response });
          })
        );
      })
    ))
  );


  @Effect()
  checkIfMemberNumberAndDnidCombinationExists$ = this.actions$.pipe(
    ofType(MobileTerminalActions.memberNumberAndDnidCombinationExists),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(MobileTerminalSelectors.getMemberNumberAndDnidCombinationExists)
      ),
      mergeMap(([pipedAction, authToken, memberAndDnidCombinationExists]: Array<any>) => {
        if(pipedAction.isSelf === true){
          return new Observable((observer) => {
            observer.next(MobileTerminalActions.setMemberAndDnidCombinationExists({ channelId: pipedAction.channelId, dnidMemberNumberComboExists: false }));
            observer.complete();
          });
        }
        return this.mobileTerminalService.memberAndDnidCombinationExists(authToken, pipedAction.memberNumber, pipedAction.dnid).pipe(
          map((response: any) => {
            return MobileTerminalActions.setMemberAndDnidCombinationExists({ channelId: pipedAction.channelId, dnidMemberNumberComboExists: response });
          })
        );
      })
    ))
  );


}
