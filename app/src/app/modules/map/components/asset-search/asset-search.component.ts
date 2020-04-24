import { Component, Input, OnChanges } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';
import * as AssetTypes from '@data/asset/asset.types';

type QueryParam = Readonly<{
  queryObject: AssetTypes.AssetFilterQuery;
  queryString: string;
}>;


@Component({
  selector: 'map-asset-search',
  templateUrl: './asset-search.component.html',
  styleUrls: ['./asset-search.component.scss']
})
export class AssetSearchComponent implements OnChanges {
  // tslint:disable:ban-types
  @Input() autocompleteFunction: Function;
  @Input() centerMapOnPosition: Function;
  @Input() selectAsset: Function;
  // tslint:enable:ban-types
  @Input() autocompleteResult: Array<AssetTypes.AssetMovementWithEssentials>;

  public searchResults = [];
  public searchQuery = '';

  searchKeyUp = (event) => {
    if (
      event.key !== 'Enter' && typeof event.key !== 'undefined' &&
      event.key !== 'ArrowUp' && event.key !== 'ArrowDown' &&
      event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'
    ) {
      if(this.searchQuery.indexOf('/c') !== 0) {
        this.autocompleteFunction(this.searchQuery);
      }
    } else if(event.key === 'Enter' && this.searchQuery.match(/^(\/c)\s*(\-?\d+(\.\d+)?),?\s*(\-?\d+(\.\d+)?)$/)) {
      const searchQueryParts = this.searchQuery.split(/^(\/c)\s*(\-?\d+(\.\d+)?),?\s*(\-?\d+(\.\d+)?)$/);
      const latitude = parseFloat(searchQueryParts[2]);
      const longitude = parseFloat(searchQueryParts[4]);
      this.centerMapOnPosition({ longitude, latitude });
    }
  }

  optionSelected = (event) => {
    const selectedId = event.option._element.nativeElement.id;
    const selectedAsset = this.autocompleteResult.find((asset) => asset.assetEssentials.assetId === selectedId);
    const selectAsset = this.selectAsset(selectedAsset.assetEssentials.assetId);
    this.centerMapOnPosition(selectedAsset.assetMovement.microMove.location);
  }

  ngOnChanges() {
    if (typeof this.autocompleteResult !== 'undefined') {
      if(this.autocompleteResult.length === 0) {
        this.searchResults = [];
      } else {
        let lastIndex = 0;
        this.searchResults = this.autocompleteResult.sort((a, b) => {
          const nameA = a.assetEssentials.assetName.toUpperCase(); // ignore upper and lowercase
          const nameB = b.assetEssentials.assetName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        }).reduce((acc, assetWrapper, index) => {
          if(index >= 10) {
            return acc;
          }
          if (typeof acc[index] === 'undefined' || acc[index].id !== assetWrapper.assetEssentials.assetId) {
            acc[index] = { id: assetWrapper.assetEssentials.assetId, value: assetWrapper.assetEssentials.assetName };
          }
          lastIndex = index;
          return acc;
        }, this.searchResults);
        if (this.searchResults.length !== lastIndex + 1) {
          this.searchResults = this.searchResults.slice(0, lastIndex + 1);
        }
      }
    }
  }
}
