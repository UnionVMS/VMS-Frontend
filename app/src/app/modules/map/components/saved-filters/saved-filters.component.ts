import { Component, Input, TemplateRef, ElementRef, ViewChild } from '@angular/core';
import { AssetTypes } from '@data/asset';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'map-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss'],
})
export class SavedFiltersComponent {
  @Input() saveFilterFunction: (filter: MapSavedFiltersTypes.SavedFilter) => void;
  @Input() activeFilters: ReadonlyArray<string>;
  @Input() activateFilter: (filterName: string) => void;
  @Input() deactivateFilter: (filterName: string) => void;
  @Input() deleteFilter: (filterId: string) => void;
  @Input() filterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>;
  @Input() savedFilters: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>;

  public savedFilterNames = [];
  public creatingNewFilter = false;
  public newFilterName = '';

  @ViewChild('createNewFilterNameInput') createNewFilterNameInput: ElementRef;

  constructor(private readonly dialog: MatDialog) {}

  toggleFilter(filterId: string) {
    if(this.activeFilters.includes(filterId)) {
      this.deactivateFilter(filterId);
    } else {
      this.activateFilter(filterId);
    }
  }

  trackBySavedFilterIds(index: number, savedFilter: MapSavedFiltersTypes.SavedFilter) {
    return savedFilter.id;
  }

  saveFilter() {
    if(this.newFilterName.length > 0 && this.filterQuery.length > 0) {
      this.saveFilterFunction({ name: this.newFilterName, filter: this.filterQuery });
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

  createNewFilter() {
    this.creatingNewFilter = true;
    setTimeout(() => {
      this.createNewFilterNameInput.nativeElement.focus();
    }, 100);
  }

  cancelFilter() {
    this.creatingNewFilter = false;
    this.newFilterName = '';
  }

  openDialog(templateRef: TemplateRef<any>, actionFunction: (id: string) => void, id: string) {
    const dialogRef = this.dialog.open(templateRef);
    dialogRef.afterClosed().subscribe(result => {
      if(result === true) {
        actionFunction(id);
      }
    });
  }
}
