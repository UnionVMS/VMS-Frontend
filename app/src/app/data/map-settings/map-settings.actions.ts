import { createAction, props } from '@ngrx/store';
import { State, Settings, Viewport } from './map-settings.interfaces';

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

export const saveViewport = createAction(
  '[MapSettings] Save viewport',
  props<{ key: number, viewport: Viewport }>()
);

export const replaceSettings = createAction(
  '[MapSettings] Replace settings',
  props<{ settings: Settings }>()
);

export const saveSettings = createAction(
  '[MapSettings] API - Save settings',
  props<{ settings: Settings }>()
);
