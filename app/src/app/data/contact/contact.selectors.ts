import { createSelector } from '@ngrx/store';
import * as ContactTypes from './contact.types';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectContacts = (state: State) => state.contact.contacts;

export const getContactsOnAsset = createSelector(
  selectContacts,
  getMergedRoute,
  (contacts: { [id: string ]: ContactTypes.Contact }, mergedRoute) => {
   return Object.values(contacts).filter(contact => contact.assetId === mergedRoute.params.assetId);
  }
);

export const getContactByUrl = createSelector(
  selectContacts,
  getMergedRoute,
  (contacts, mergedRoute) => {
    if(typeof contacts[mergedRoute.params.contactId] !== 'undefined') {
      const contact = contacts[mergedRoute.params.contactId];
      return { ...contact };
    }
    return undefined;
  }
);
