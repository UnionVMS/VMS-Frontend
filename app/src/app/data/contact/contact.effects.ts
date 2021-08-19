import { Injectable } from '@angular/core';
import { Store} from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY, Observable } from 'rxjs';
import { map, mergeMap, withLatestFrom, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';
import { ContactActions, ContactReducer, ContactTypes } from './';
import { ContactService } from './contact.service';
import * as NotificationsActions from '../notifications/notifications.actions';
import { AuthSelectors } from '../auth';

import { apiErrorHandler, apiUpdateTokenHandler } from '@app/helpers/api-response-handler';

@Injectable()
export class ContactEffects {

  private readonly apiErrorHandler: (response: any, index: number, withHeaders?: boolean) => boolean;
  private readonly apiUpdateTokenHandler: (response: any) => any;

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly contactService: ContactService,
    private readonly router: Router
  ) {
    this.apiErrorHandler = apiErrorHandler(this.store);
    this.apiUpdateTokenHandler = apiUpdateTokenHandler(this.store);
  }

  getContactsForSelectedAssetObserver$ = createEffect(() => this.actions$.pipe(
    ofType(ContactActions.getContactsForSelectedAsset),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.assetId !== 'undefined') {
          return this.contactService.getContactsFromAssetId(authToken, mergedRoute.params.assetId).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
            map((response: any) => {
              return ContactActions.setContacts({
                contacts: response.reduce((acc: { [id: string]: ContactTypes.Contact }, contact: ContactTypes.Contact) => {
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
  ));

  getSelectedContact$ = createEffect(() => this.actions$.pipe(
    ofType(ContactActions.getSelectedContact),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken),
        this.store.select(getMergedRoute)
      ),
      mergeMap(([pipedAction, authToken, mergedRoute]: Array<any>) => {
        if(typeof mergedRoute.params !== 'undefined' && typeof mergedRoute.params.contactId !== 'undefined') {
          return this.contactService.getContactById(authToken, mergedRoute.params.contactId).pipe(
            filter((response: any, index: number) => this.apiErrorHandler(response, index)),
            map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
            map((contact: ContactTypes.Contact) => {
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
  ));

  saveContact$ = createEffect(() => this.actions$.pipe(
    ofType(ContactActions.saveContact),
    mergeMap((action) => of(action).pipe(
      withLatestFrom(
        this.store.select(AuthSelectors.getAuthToken)
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
          filter((response: any, index: number) => this.apiErrorHandler(response, index)),
          map((response) => { this.apiUpdateTokenHandler(response); return response.body; }),
          map((contact: any) => {
            let notification = $localize`:@@ts-contact-update-success:Contact updated successfully!`;
            this.router.navigate(['/asset/' + contact.assetId]);
            if(isNew) {
              notification = $localize`:@@ts-contact-created-success:Contact created successfully!`;
            }
            return [ContactActions.setContacts({ contacts: { [contact.id]: contact } }), NotificationsActions.addSuccess(notification)];
          })
        );
      }),
      mergeMap((rAction, index) => rAction)
    ))
  ));

}
