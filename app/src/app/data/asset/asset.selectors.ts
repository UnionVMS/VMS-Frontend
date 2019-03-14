import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from './asset.reducer';

export const getAssetState = createFeatureSelector<State>('asset');

export const getAssets = createSelector(
  getAssetState,
  (state: State) => {
    return Object.keys(state.assets).map(key => state.assets[key]);
  }
)
