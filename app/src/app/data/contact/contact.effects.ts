import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, flatMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    private router: Router
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
              console.warn(response);
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


  @Effect()
  saveContact$ = this.actions$.pipe(
    ofType(ContactActions.saveContact),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store$.select(AuthSelectors.getAuthToken)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        const isNew = action.contact.id === undefined || action.contact.id === null;
        let request: Observable<object>;
        if(isNew) {
          request = this.contactService.createContact(authToken, action.contact);
        } else {
          request = this.contactService.updateContact(authToken, action.contact);
        }

        return request.pipe(
          map((contact: any) => {
            let notification = 'Contact updated successfully!';
            this.router.navigate(['/asset/' + contact.assetId]);
            if(isNew) {
              notification = 'Contact created successfully!';
            }
            return [ContactActions.setContacts({ contacts: { [contact.id]: contact } }), NotificationsActions.addSuccess(notification)];
          })
        );
      }),
      flatMap((rAction, index) => rAction)
    ))
  );

}
