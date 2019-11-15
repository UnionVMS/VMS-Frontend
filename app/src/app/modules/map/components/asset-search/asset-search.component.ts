import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';
import * as AssetInterfaces from '@data/asset/asset.interfaces';

type QueryParam = Readonly<{
  queryObject: AssetInterfaces.AssetFilterQuery;
  queryString: string;
}>;


@Component({
  selector: 'map-asset-search',
  templateUrl: './asset-search.component.html',
  styleUrls: ['./asset-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetSearchComponent implements OnChanges {
  // tslint:disable:ban-types
  @Input() autocompleteFunction: Function;
  @Input() centerMapOnPosition: Function;
  @Input() selectAsset: Function;
  @Input() filterFunction: Function;
  // tslint:enable:ban-types
  @Input() autocompleteResult: Array<AssetInterfaces.AssetMovementWithEssentials>;

  public filterQuery = '';
  public searchResults = [];
  public searchQuery = '';

  private handleQueryString = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(!queryObject.isNumber && !(queryString.indexOf('/') === 0)) {
      const values = queryString.split(',').map(value => value.trim()).filter(value => value.length > 0);

      if(queryString.indexOf('!') === 0) {
        return {
          queryObject: { ...queryObject, values, inverse: true },
          queryString: queryString.substring(1)
        };
      }

      return { queryObject: { ...queryObject, values }, queryString };
    }
    return { queryObject, queryString };
  }

  private handleQueryNumber = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(queryObject.isNumber) {
      return {
        queryObject: { ...queryObject, values: queryString.split(',')
          .map(value => value.trim())
          .filter(value => value.length > 0)
          .map((value) => {
            if(value.indexOf('<') !== -1) {
              return { operator: 'less then', value: value.substring(1) };
            } else if(value.indexOf('>') !== -1) {
              return { operator: 'greater then', value: value.substring(1) };
            } else if(value.indexOf('~') !== -1) {
              return { operator: 'almost equal', value: value.substring(1) };
            } else {
              return { operator: 'equal', value };
            }
          }).filter(valueObject => valueObject.value.trim().length > 0)
          .map(valueObject => {
            return { ...valueObject, value: parseFloat(valueObject.value) };
          })
        },
        queryString
      };
    }
    return { queryObject, queryString };
  }

  private setQueryType = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(queryString.indexOf('/f ') === 0) {
      return { queryObject: { ...queryObject, type: 'flagstate' }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/i ') === 0) {
      return { queryObject: { ...queryObject, type: 'ircs' }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/c ') === 0) {
      return { queryObject: { ...queryObject, type: 'cfr' }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/v ') === 0) {
      return { queryObject: { ...queryObject, type: 'vesselType' }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/e ') === 0) {
      return { queryObject: { ...queryObject, type: 'externalMarking' }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/l ') === 0) {
      return { queryObject: { ...queryObject, type: 'lengthOverAll', isNumber: true }, queryString: queryString.substring(3) };
    }
    return { queryObject, queryString };
  }

  filterKeyUp = (event) => {
    const filterQuery = this.filterQuery.split('&');
    this.filterFunction(filterQuery.map(queryPart => {
      const queryResult = this.handleQueryString(
        this.handleQueryNumber(
          this.setQueryType({
            queryObject: {
              type: 'name',
              values: [],
              inverse: false,
              isNumber: false
            },
            queryString: queryPart.trim()
          })
        )
      );
      return queryResult.queryObject;
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
