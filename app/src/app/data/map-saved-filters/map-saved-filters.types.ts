import { AssetFilterQuery } from '../asset/asset.types';

export { AssetFilterQuery };

export type SavedFilter = Readonly<{
  id?: string,
  name: string;
  filter: ReadonlyArray<AssetFilterQuery>;
}>;

export type State = Readonly<{
  activeFilters: ReadonlyArray<string>;
  savedFilters: { readonly [id: number]: SavedFilter };
}>;
