import { AssetFilterQuery } from '../asset/asset.interfaces';

export type SavedFilter = Readonly<{
  // id: number,
  name: string;
  filter: ReadonlyArray<AssetFilterQuery>;
}>;

export type State = Readonly<{
  activeFilters: ReadonlyArray<string>;
  savedFilters: { readonly [filterName: string]: ReadonlyArray<AssetFilterQuery> };
  // savedFilters: { readonly [id: number]: SavedFilter };
}>;
