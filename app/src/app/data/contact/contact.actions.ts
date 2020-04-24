import { createAction, props } from '@ngrx/store';
import * as ContactTypes from './contact.types';

export const getContactsForSelectedAsset = createAction(
  '[Contacts] Get contacts from asset id'
);

export const setContacts = createAction(
  '[Contacts] Set contacts',
  props<{ contacts: { [id: string]: ContactTypes.Contact } }>()
);

export const saveContact = createAction(
  '[Contacts] Save contact',
  props<{ contact: ContactTypes.Contact }>()
);

export const getSelectedContact = createAction(
  '[Contacts] Get selected contact'
);
