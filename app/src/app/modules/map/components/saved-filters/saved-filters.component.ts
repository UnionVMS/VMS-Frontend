import { Component, Input, OnChanges } from '@angular/core';
import { AssetInterfaces } from '@data/asset';
import { MapSavedFiltersInterfaces } from '@data/map-saved-filters';

@Component({
  selector: 'map-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss'],
})
export class SavedFiltersComponent implements OnChanges {
  @Input() addSavedFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  @Input() activeFilters: ReadonlyArray<string>;
  @Input() activateFilter: (filterName: string) => void;
  @Input() deactivateFilter: (filterName: string) => void;
  @Input() filterQuery: ReadonlyArray<AssetInterfaces.AssetFilterQuery>;
  @Input() savedFilters: Readonly<{ readonly [filterName: string]: ReadonlyArray<AssetInterfaces.AssetFilterQuery> }>;

  public savedFilterNames = [];
  public creatingNewFilter = false;
  public newFilterName = '';

  ngOnChanges() {
    this.savedFilterNames = Object.keys(this.savedFilters);
  }

  toggleFilter(filterName) {
    if(this.activeFilters.includes(filterName)) {
      this.deactivateFilter(filterName);
    } else {
      this.activateFilter(filterName);
    }
  }

  saveFilter() {
    if(this.newFilterName.length > 0 && this.filterQuery.length > 0) {
      this.addSavedFilter({ name: this.newFilterName, filter: this.filterQuery });
      this.creatingNewFilter = false;
      this.newFilterName = '';
    } else {
      if(this.newFilterName.length === 0) {
        alert('Please insert desired filter name.');
      } else {
        alert('Filter query missing!');
      }
    }
  }
}
