import { createSelector } from '@ngrx/store';
import * as ContactInterfaces from './contact.interfaces';
import { State } from '@app/app-reducer';
import { getMergedRoute } from '@data/router/router.selectors';


export const selectContacts = (state: State) => state.contact.contacts;

export const getContacts = createSelector(
  selectContacts,
  (contacts: { [id: string ]: ContactInterfaces.Contact }) => {
    return Object.values(contacts).map((contact) => ({ ...contact }));
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
