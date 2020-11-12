import { createAction, props } from '@ngrx/store';
import { State, Settings, MapLocation } from './map-settings.types';

export const getMovementSources = createAction(
  '[MapSettings] Get movement sources'
);

export const setMovementSources = createAction(
  '[MapSettings] Set movement sources',
  props<{ movementSources: ReadonlyArray<string> }>()
);

export const setChoosenMovementSources = createAction(
  '[MapSettings] Set choosen movement sources',
  props<{ movementSources: ReadonlyArray<string> }>()
);

export const setVisibilityForAssetNames = createAction(
  '[MapSettings] Set visibility for asset names',
  props<{ visibility: boolean }>()
);

export const setVisibilityForAssetSpeeds = createAction(
  '[MapSettings] Set visibility for asset speeds',
  props<{ visibility: boolean }>()
);

export const setVisibilityForFlags = createAction(
  '[MapSettings] Set visibility for flags',
  props<{ visibility: boolean }>()
);

export const setVisibilityForTracks = createAction(
  '[MapSettings] Set visibility for tracks',
  props<{ visibility: boolean }>()
);

export const setVisibilityForForecast = createAction(
  '[MapSettings] Set visibility for forecast',
  props<{ visibility: boolean }>()
);

export const setTracksMinuteCap = createAction(
  '[MapSettings] Set tracks minute cap',
  props<{ minutes: number }>()
);

export const setForecastInterval = createAction(
  '[MapSettings] Set forecast interval',
  props<{ interval: number }>()
);

export const setCurrentControlPanel = createAction(
  '[MapSettings] Set current control panel',
  props<{ controlPanelName: string|null }>()
);

export const saveMapLocation = createAction(
  '[MapSettings] Save map location',
  props<{ key: number, mapLocation: MapLocation, save?: boolean }>()
);

export const setMapLocations = createAction(
  '[MapSettings] Set map locations',
  props<{ mapLocations: { [key: number]: MapLocation } }>()
);

export const deleteMapLocation = createAction(
  '[MapSettings] Delete map location',
  props<{ key: number }>()
);

export const replaceSettings = createAction(
  '[MapSettings] Replace settings',
  props<{ settings: Settings }>()
);

export const saveSettings = createAction(
  '[MapSettings] API - Save settings',
  props<{ settings: Settings }>()
);
