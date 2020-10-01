import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { AssetSelectors } from '../asset';
import { MobileTerminalActions, MobileTerminalTypes, MobileTerminalSelectors } from './';
import { MobileTerminalService } from './mobile-terminal.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthTypes, AuthSelectors } from '../auth';
import * as RouterSelectors from '@data/router/router.selectors';

import { hashCode } from '@app/helpers/helpers';

@Injectable()
export class MobileTerminalEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<State>,
    private readonly mobileTerminalService: MobileTerminalService,
    private readonly router: Router
  ) {}

  @Effect()
  search$ = this.actions$.pipe(
    ofType(MobileTerminalActions.search),
    withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
    mergeMap(([action, authToken]) => {
      return this.mobileTerminalService.search(authToken, action.query, action.includeArchived).pipe(
        map((response: { mobileTerminalList: Array<MobileTerminalTypes.MobileTerminal> }) => {
          const result = [
            MobileTerminalActions.addMobileTerminals({
              mobileTerminals: response.mobileTerminalList.reduce((acc, mobileTerminal) => {
                acc[mobileTerminal.id] = mobileTerminal;
                return acc;
              }, {})
            })
          ];

          if(action.saveAsSearchResult === true) {
            return [
              ...result,
              MobileTerminalActions.addSearchResult({
                uniqueHash: hashCode(JSON.stringify(action.query) + action.includeArchived ? 't' : 'f'),
                mobileTerminalIds: response.mobileTerminalList.map(mobileTerminal => mobileTerminal.id)
              })
            ];
          } else {
            return result;
          }
        }),
        flatMap((rAction, index) => rAction),
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
          map((mobileTerminal: MobileTerminalTypes.MobileTerminal) => {
            return MobileTerminalActions.setMobileTerminal({ mobileTerminal });
          })
        );
      })
    ))
  );

  @Effect()
  getMobileTerminal$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getMobileTerminal),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.mobileTerminalService.getMobileTerminal(authToken, action.mobileTerminalId).pipe(
          map((mobileTerminal: MobileTerminalTypes.MobileTerminal) => {
            return MobileTerminalActions.setMobileTerminal({ mobileTerminal });
          })
        );
      })
    ))
  );

  @Effect()
  getMobileTerminalHistoryForAsset$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getMobileTerminalHistoryForAsset),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.mobileTerminalService.getMobileTerminalHistoryForAsset(authToken, action.assetId).pipe(
          map((response: MobileTerminalTypes.MobileTerminalHistoryList) => {
            return MobileTerminalActions.setMobileTerminalHistoryForAsset({
              mobileTerminalHistory: { [action.assetId]: response }
            });
          })
        );
      })
    ))
  );

  @Effect()
  getProposedMemberNumber$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getProposedMemberNumber),
    mergeMap((outerAction) => of(outerAction).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([action, authToken]: Array<any>) => {
        return this.mobileTerminalService.getProposedMemberNumber(authToken, action.dnid).pipe(
          map((response: any) => {
            return MobileTerminalActions.setProposedMemberNumber({ memberNumber: response });
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
          request = this.mobileTerminalService.createMobileTerminal(authToken, action.mobileTerminal);
        } else {
          request = this.mobileTerminalService.updateMobileTerminal(authToken, action.mobileTerminal);
        }
        return request.pipe(
          map((mobileTerminal: any) => {
            const assetId = typeof mobileTerminal.assetId !== 'undefined' ? mobileTerminal.assetId : selectedAsset.id;
            let notification = $localize`:@@ts-mobile-terminal-updated:Mobile terminal updated successfully!`;
            this.router.navigate(['/asset/' + assetId + '/mobileTerminals']);
            if(isNew) {
              notification = $localize`:@@ts-mobile-terminal-created:Mobile terminal created successfully!`;
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
    ofType(MobileTerminalActions.getSerialNumberExists),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(this.store$.select(AuthSelectors.getAuthToken)),
      mergeMap(([pipedAction, authToken]: Array<any>) => {
        if(pipedAction.isSelf === true) {
          return new Observable((observer) => {
            observer.next(MobileTerminalActions.setSerialNumberExists({ serialNumberExists: false }));
            observer.complete();
          });
        }
        return this.mobileTerminalService.getSerialNumberExists(authToken, pipedAction.serialNumber).pipe(
          map((response: any) => {
            return MobileTerminalActions.setSerialNumberExists({ serialNumberExists: response });
          })
        );
      })
    ))
  );


  @Effect()
  checkIfMemberNumberAndDnidCombinationExists$ = this.actions$.pipe(
    ofType(MobileTerminalActions.getMemberNumberAndDnidCombinationExists),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(MobileTerminalSelectors.getMemberNumberAndDnidCombinationExists)
      ),
      mergeMap(([pipedAction, authToken, memberAndDnidCombinationExists]: Array<any>) => {
        if(pipedAction.isSelf === true) {
          return new Observable((observer) => {
            observer.next(MobileTerminalActions.setMemberNumberAndDnidCombinationExists({
              channelId: pipedAction.channelId,
              dnidMemberNumberComboExists: false
            }));
            observer.complete();
          });
        }
        return this.mobileTerminalService.getMemberAndDnidCombinationExists(authToken, pipedAction.memberNumber, pipedAction.dnid).pipe(
          map((response: any) => {
            return MobileTerminalActions.setMemberNumberAndDnidCombinationExists({
              channelId: pipedAction.channelId,
              dnidMemberNumberComboExists: response
            });
          })
        );
      })
    ))
  );


}
