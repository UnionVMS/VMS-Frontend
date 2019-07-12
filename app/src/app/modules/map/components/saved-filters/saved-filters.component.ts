import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'map-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss']
})
export class SavedFiltersComponent implements OnChanges {
  @Input() addSavedFilter;
  @Input() activeFilters;
  @Input() activateFilter;
  @Input() deactivateFilter;
  @Input() filterQuery;
  @Input() savedFilters;

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
