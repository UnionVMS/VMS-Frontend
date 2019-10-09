import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';

import { State } from '@app/app-reducer.ts';
import { getMergedRoute } from '@data/router/router.selectors';
import { ContactActions, ContactReducer, ContactInterfaces } from './';
import { ContactService } from './contact.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthInterfaces, AuthSelectors } from '../auth';
import * as RouterSelectors from '@data/router/router.selectors';

@Injectable()
export class ContactEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<State>,
    private contactService: ContactService,
  ) {}

  @Effect()
  getContactsForSelectedAssetObserver$ = this.actions$.pipe(
    ofType(ContactActions.getContactsForSelectedAsset),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.assetId !== 'undefined') {
          return this.contactService.getContactsFromAssetId(authToken, mergedRoute.params.assetId).pipe(
            map((response: any) => {
                return ContactActions.setContacts({
                contacts: response.reduce((acc: { [id: string]: ContactInterfaces.Contact }, contact: ContactInterfaces.Contact) => {
                  acc[contact.id] = contact;
                  return acc;
                }, {})
              });
            })
          );
        } else {
          return EMPTY;
        }
      })
    ))
  );

  @Effect()
  getSelectedContact$ = this.actions$.pipe(
    ofType(ContactActions.getSelectedContact),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken),
        this.store$.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.contactId !== 'undefined') {
          return this.contactService.getContactById(authToken, mergedRoute.params.contactId).pipe(
            map((contact: ContactInterfaces.Contact) => {
              return ContactActions.setContacts({
                contacts: { [contact.id]: contact }
              });
            })
          );
        } else {
          return EMPTY;
        }
      })
    ))
  );

  //
  // @Effect()
  // saveContact$ = this.actions$.pipe(
  //   ofType(ContactActions.saveContact),
  //   mergeMap((action) => of(action).pipe(
  //     withLatestFrom(
  //       this.store$.select(AuthSelectors.getAuthToken),
  //       this.store$.select(AssetSelectors.getSelectedAsset)
  //     ),
  //     mergeMap(([pipedAction, authToken, selectedAsset]: Array<any>) => {
  //       const isNew = action.mobileTerminal.id === undefined || action.mobileTerminal.id === null;
  //       let request: Observable<object>;
  //       if(isNew) {
  //         if(typeof action.mobileTerminal.asset === 'undefined' && typeof selectedAsset !== 'undefined') {
  //           const tmpAsset = { ...selectedAsset };
  //           delete tmpAsset.mobileTerminals;
  //           request = this.mobileTerminalService.createMobileTerminal(authToken, { ...action.mobileTerminal, asset: tmpAsset });
  //         } else {
  //           request = this.mobileTerminalService.createMobileTerminal(authToken, action.mobileTerminal);
  //         }
  //       } else {
  //         request = this.mobileTerminalService.updateMobileTerminal(authToken, action.mobileTerminal);
  //       }
  //       return request.pipe(
  //         map((mobileTerminal: any) => {
  //           mobileTerminal.assetId = mobileTerminal.asset.id;
  //           let notification = 'Mobile terminal updated successfully!';
  //           this.router.navigate(['/asset/' + mobileTerminal.assetId]);
  //           if(isNew) {
  //             notification = 'Asset created successfully!';
  //           }
  //           return [MobileTerminalActions.setMobileTerminal({ mobileTerminal }), NotificationsActions.addSuccess(notification)];
  //         })
  //       );
  //     }),
  //     flatMap((rAction, index) => rAction)
  //   ))
  // );

}
