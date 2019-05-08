import { Component, Input, OnChanges } from '@angular/core';
import { formatDate } from '../../../../helpers';
import * as AssetInterfaces from '@data/asset/asset.interfaces';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'map-asset-search',
  templateUrl: './asset-search.component.html',
  styleUrls: ['./asset-search.component.scss']
})
export class AssetSearchComponent implements OnChanges {
  // tslint:disable:ban-types
  @Input() autocompleteFunction: Function;
  @Input() centerMapOnPosition: Function;
  @Input() filterFunction: Function;
  // tslint:enable:ban-types
  @Input() autocompleteResult: Array<AssetInterfaces.AssetMovement>;

  public filterQuery = '';
  public searchResults = [];
  public searchQuery = '';

  filterKeyUp = (event) => {
    const filterQuery = this.filterQuery.split(';');
    this.filterFunction(filterQuery.map(queryPart => {
      queryPart = queryPart.trim();
      const queryObject: AssetInterfaces.AssetFilterQuery = {
        type: 'name',
        values: [],
        inverse: false,
      };
      if(queryPart.indexOf('/f ') === 0) {
        queryObject.type = 'flagstate';
        queryPart = queryPart.substring(3);
      }
      if(queryPart.indexOf('/') === 0) {
        return queryObject;
      }
      if(queryPart.indexOf('!') === 0) {
        queryObject.inverse = true;
        queryPart = queryPart.substring(1);
      }
      queryObject.values = queryPart.split(',').map(value => value.trim()).filter(value => value.length > 0);
      return queryObject;
    }).filter(queryObject => queryObject.values.length > 0));
  }

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
    const selectedAsset = this.autocompleteResult.find((asset) => asset.asset === selectedId);
    this.centerMapOnPosition(selectedAsset.microMove.location);
  }

  ngOnChanges() {
    if (typeof this.autocompleteResult !== 'undefined') {
      if(this.autocompleteResult.length === 0) {
        this.searchResults = [];
      } else {
        let lastIndex = 0;
        this.searchResults = this.autocompleteResult.sort((a, b) => {
          const nameA = a.assetName.toUpperCase(); // ignore upper and lowercase
          const nameB = b.assetName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        }).reduce((acc, asset, index) => {
          if(index >= 10) {
            return acc;
          }
          if (typeof acc[index] === 'undefined' || acc[index].id !== asset.asset) {
            acc[index] = { id: asset.asset, value: asset.assetName };
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
