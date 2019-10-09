import { createAction, props } from '@ngrx/store';
import * as ContactInterfaces from './contact.interfaces';

export const getContactsForSelectedAsset = createAction(
  '[Contacts] Get contacts from asset id'
);

export const setContacts = createAction(
  '[Contacts] Set contacts',
  props<{ contacts: { [id: string]: ContactInterfaces.Contact } }>()
);

export const saveContact = createAction(
  '[Contacts] Save contact',
  props<{ contact: ContactInterfaces.Contact }>()
);

export const getSelectedContact = createAction(
  '[Contacts] Get selected contact'
);
