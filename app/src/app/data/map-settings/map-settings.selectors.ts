import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './map-settings.reducer';

export const getMapSettingsState = createFeatureSelector<State>('mapSettings');
//
// export const getAssets = createSelector(
//   getAssetState,
//   (state: State) => {
//     return Object.keys(state.assets).map(key => state.assets[key]);
//   }
// )
