import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { Observable, Subscriber } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { routerReducer} from '@ngrx/router-store';

import { AssetReducer, AssetTypes } from './data/asset/';
import { AuthReducer, AuthTypes, AuthActions } from './data/auth/';
import { ContactReducer, ContactTypes } from './data/contact/';
import { IncidentReducer, IncidentTypes } from './data/incident/';
import { ActivityReducer, ActivityTypes } from './data/activity/';
import { MapReducer, MapTypes } from './data/map/';
import { MapSettingsReducer, MapSettingsTypes } from './data/map-settings/';
import { MapLayersReducer, MapLayersTypes } from './data/map-layers/';
import { MapSavedFiltersReducer, MapSavedFiltersTypes } from './data/map-saved-filters/';
import { NotificationsReducer, NotificationsTypes } from './data/notifications/';
import { MergedRouteReducerState } from './data/router/router.types';
import { MobileTerminalReducer, MobileTerminalTypes } from './data/mobile-terminal/';
import { NotesReducer, NotesTypes } from './data/notes/';
import { UserSettingsReducer, UserSettingsTypes } from './data/user-settings/';


export type State = Readonly<{
  asset: AssetTypes.State;
  auth: AuthTypes.State;
  contact: ContactTypes.State;
  incident: IncidentTypes.State;
  activity: ActivityTypes.State;
  map: MapTypes.State;
  mapLayers: MapLayersTypes.State;
  mapSettings: MapSettingsTypes.State;
  mapSavedFilters: MapSavedFiltersTypes.State;
  mobileTerminal: MobileTerminalTypes.State;
  notifications: NotificationsTypes.State;
  router: MergedRouteReducerState;
  notes: NotesTypes.State;
  userSettings: UserSettingsTypes.State;
}>;

export const reducers: ActionReducerMap<State> = {
  asset: AssetReducer.assetReducer,
  auth: AuthReducer.authReducer,
  contact: ContactReducer.contactReducer,
  incident: IncidentReducer.incidentReducer,
  activity: ActivityReducer.activityReducer,
  map: MapReducer.mapReducer,
  mapLayers: MapLayersReducer.mapLayersReducer,
  mapSettings: MapSettingsReducer.mapSettingsReducer,
  mapSavedFilters: MapSavedFiltersReducer.mapSavedFiltersReducer,
  mobileTerminal: MobileTerminalReducer.mobileTerminalReducer,
  notifications: NotificationsReducer.notificationsReducer,
  router: routerReducer,
  notes: NotesReducer.notesReducer,
  userSettings: UserSettingsReducer.userSettingsReducer,
};

let setAuthTokenSubscriber: Subscriber<unknown>;
const setAuthToken$ = new Observable(subscriber => {
  setAuthTokenSubscriber = subscriber;
}).pipe(bufferTime(1000)).subscribe((rawTokens) => {
  if(rawTokens.length > 0) {
    window.localStorage.authToken = rawTokens[rawTokens.length - 1];
  }
});

// Not allowed to use EC6 function notation here for some reason, i18n extractor goes crasy...
// tslint:disable-next-line:only-arrow-functions
export function saveJwtTokenToStorage(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action: any) => {
    if(action.type === AuthActions.loginSuccess.type || action.type === AuthActions.updateToken.type) {
      setAuthTokenSubscriber.next(action.payload.jwtToken.raw);
    }

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] =
  environment.production
    ? [saveJwtTokenToStorage]
    : [saveJwtTokenToStorage];
