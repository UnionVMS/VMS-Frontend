import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';
import * as AssetTypes from '@data/asset/asset.types';

type QueryParam = Readonly<{
  queryObject: AssetTypes.AssetFilterQuery;
  queryString: string;
}>;


@Component({
  selector: 'map-asset-filter',
  templateUrl: './asset-filter.component.html',
  styleUrls: ['./asset-filter.component.scss']
})
export class AssetFilterComponent implements OnChanges, OnInit {
  @Input() filterFunction: (filterQuery: Array<AssetTypes.AssetFilterQuery>) => void;
  @Input() filterQuerySaved: ReadonlyArray<AssetTypes.AssetFilterQuery>;

  public filterQuery = '';
  public displayInfo = false;
  public hideInfoFunction: () => void;

  private readonly handleQueryString = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(!queryObject.isNumber && !(queryString.indexOf('/') === 0)) {
      if(queryString.indexOf('!') === 0) {
        queryString = queryString.substring(1);
        const values = queryString.split(',').map(value => value.trim()).filter(value => value.length > 0);
        return { queryObject: { ...queryObject, values, inverse: true }, queryString };
      } else {
        const values = queryString.split(',').map(value => value.trim()).filter(value => value.length > 0);
        return { queryObject: { ...queryObject, values }, queryString };
      }
    }
    return { queryObject, queryString };
  }

  private readonly handleQueryNumber = ({ queryObject, queryString }: QueryParam): QueryParam => {
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

  private readonly setQueryType = ({ queryObject, queryString }: QueryParam): QueryParam => {
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

  generateQueryStringFromFilter(filters: ReadonlyArray<AssetTypes.AssetFilterQuery>) {
    const typeList = { flagstate: 'f', ircs: 'i', cfr: 'c', vesselType: 'v', externalMarking: 'e', lengthOverAll: 'l' };
    const operatorList = { 'less then': '< ', 'greater then': '> ', 'almost equal': '~ ', equal: '' };
    return filters.map(filter => {
      let valueString: string;
      if(filter.isNumber) {
        valueString = filter.values.map(value => {
          return `${operatorList[value.operator]}${value.value}`;
        }).join(',');
      } else {
        valueString = filter.values.join(',');
      }
      return `/${typeList[filter.type]} ${valueString}`;
    }).join(' && ');
  }

  ngOnInit() {
    if(this.filterQuerySaved.length > 0) {
      this.filterQuery = this.generateQueryStringFromFilter(this.filterQuerySaved);
    }
    this.hideInfoFunction = () => {
      this.displayInfo = false;
    };
  }

  ngOnChanges() {
    // console.warn(this.filterQuerySaved);
    // this.filterQuery = this.filterQuerySaved;
  }
}
