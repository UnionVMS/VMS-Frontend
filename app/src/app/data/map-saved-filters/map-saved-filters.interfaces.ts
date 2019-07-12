import { AssetFilterQuery } from '../asset/asset.interfaces';

export interface SavedFilter {
  name: string;
  filter: AssetFilterQuery;
}

export interface State {
  activeFilters: Array<string>;
  savedFilters: { [filterName: string]: Array<AssetFilterQuery> };
}
