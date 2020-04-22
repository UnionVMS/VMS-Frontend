import { createSelector } from '@ngrx/store';
import * as NotificationsInterfaces from './notifications.types';
import { State } from '@app/app-reducer';

export const selectNotifications = (state: State) => state.notifications;
export const selectActiveLayers = (state: State) => state.mapLayers.activeLayers;

export const getNotifications = createSelector(
  selectNotifications,
  (notifications: NotificationsInterfaces.State) => {
    return { ...notifications };
  }
);
