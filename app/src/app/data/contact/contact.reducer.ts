import { createReducer, on } from '@ngrx/store';
import * as ContactActions from './contact.actions';
import * as ContactTypes from './contact.types';

export const initialState: ContactTypes.State = {
  contacts: {}
};

export const contactReducer = createReducer(initialState,
  on(ContactActions.setContacts, (state, { contacts }) => {
    return ({
      ...state,
      contacts: {
        ...state.contacts,
        ...contacts
      }
    });
  })
);
