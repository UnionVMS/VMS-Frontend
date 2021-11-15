import { Component, Input, OnChanges } from '@angular/core';
import * as AssetTypes from '@data/asset/asset.types';
import { convertDDMToDD, convertDDMToDDJustNumbers } from '@app/helpers/wgs84-formatter';

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
  @Input() setActiveInformationPanel: (activeInformationPanel: string | null) => void;
  @Input() setActiveRightPanel: (activeRightPanel: ReadonlyArray<string>) => void;
  @Input() autocompleteResult: Array<AssetTypes.AssetMovementWithAsset>;

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
    }else if(event.key === 'Enter'
    && this.searchQuery.match(/^(\/c)\s*(N|S)\s+(\d{1,3})(°)\s+(\d{1,2})(\.)(\d{1,})(')\s+(W|E)\s+(\d{1,3})(°)\s+(\d{1,2})(\.)(\d{1,})(')$/)) {
      // Match: /c  N 47° 55.8' E 11° 36.18'
      const searchQueryParts = this.searchQuery.split(/(?=[A-Z])/);
      const lat = searchQueryParts[1];
      const long = searchQueryParts[2];
      const location = convertDDMToDD(lat, long);
      const latitude = location.latitude;
      const longitude = location.longitude;
      this.centerMapOnPosition({ longitude, latitude });
    }else if(event.key === 'Enter'
    && this.searchQuery.match(/^(\/c)\s*(\d{1,3})\s+(\d{1,2})[,.]{1}(\d+)\s+(\d{1,3})\s+(\d{1,2})[,.]{1}(\d+)/) ){
      // Match: /c 57 56,680  11 33,840
      const searchQueryParts = this.searchQuery.trim().split(/\s+/);
      const lat = parseFloat(searchQueryParts[1]);
      const latitudeMS = parseFloat(searchQueryParts[2].replace(',','.'));
      const long = parseFloat(searchQueryParts[3]);
      const longitudeMS = parseFloat(searchQueryParts[4].replace(',','.'));
      const location = convertDDMToDDJustNumbers(lat, latitudeMS, long, longitudeMS);
      const latitude = location.latitude;
      const longitude = location.longitude;
      this.centerMapOnPosition({ longitude, latitude });
    }else if(event.key === 'Enter' && this.searchQuery.match(/^(\/c)\s*(\-?\d+(\.\d+)?),?\s*(\-?\d+(\.\d+)?)$/)) {
      const searchQueryParts = this.searchQuery.split(/^(\/c)\s*(\-?\d+(\.\d+)?),?\s*(\-?\d+(\.\d+)?)$/);
      const latitude = parseFloat(searchQueryParts[2]);
      const longitude = parseFloat(searchQueryParts[4]);
      this.centerMapOnPosition({ longitude, latitude });
    }
  }

  optionSelected = (event) => {
    const selectedId = event.option._element.nativeElement.id;
    const selectedAsset = this.autocompleteResult.find((asset) => asset.asset.id === selectedId);
    const selectAsset = this.selectAsset(selectedAsset.asset.id);
    this.centerMapOnPosition(selectedAsset.assetMovement.movement.location);
    this.setActiveInformationPanel(null);
    this.setActiveRightPanel(['showAsset']);
  }

  ngOnChanges() {
    if (typeof this.autocompleteResult !== 'undefined') {
      if(this.autocompleteResult.length === 0) {
        this.searchResults = [];
      } else {
        let lastIndex = 0;
        this.searchResults = this.autocompleteResult.sort((a, b) => {
          const nameA = a.asset.name.toUpperCase(); // ignore upper and lowercase
          const nameB = b.asset.name.toUpperCase(); // ignore upper and lowercase
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
          if (typeof acc[index] === 'undefined' || acc[index].id !== assetWrapper.asset.id) {
            let setIrcs = !assetWrapper.asset.ircs ? "" : ' --- ' + assetWrapper.asset.ircs;
            acc[index] = { id: assetWrapper.asset.id, value: assetWrapper.asset.name + setIrcs };
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
