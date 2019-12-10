import { AssetFilterQuery } from '../asset/asset.interfaces';

export type SavedFilter = Readonly<{
  name: string;
  filter: ReadonlyArray<AssetFilterQuery>;
}>;

export type State = Readonly<{
  activeFilters: ReadonlyArray<string>;
  savedFilters: { readonly [filterName: string]: ReadonlyArray<AssetFilterQuery> };
}>;
