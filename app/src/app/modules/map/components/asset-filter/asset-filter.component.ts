import { Component, Input, OnChanges } from '@angular/core';
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
export class AssetFilterComponent implements OnChanges {
  @Input() filterFunction: (filterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>) => void;
  @Input() filterQuerySaved: ReadonlyArray<AssetTypes.AssetFilterQuery>;
  @Input() setActiveInformationPanel: (activeInformationPanel: string | null) => void;
  @Input() setActiveRightPanel: (activeRightPanel: ReadonlyArray<string>) => void;

  public filterQuery = '';
  public lastSentFilterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>;

  private readonly handleQueryString = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(queryObject.valueType === AssetTypes.AssetFilterValueTypes.STRING && !(queryString.indexOf('/') === 0)) {
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

  private readonly handleQueryBoolean = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(queryObject.valueType === AssetTypes.AssetFilterValueTypes.BOOLEAN) {
      if(queryString.indexOf('!') === 0) {
        queryString = queryString.substring(1);
        const values = queryString.split(',').map(value => {
          const trimmedValue = value.trim();
          if(trimmedValue === 'true' || trimmedValue === 't') {
            return true;
          } else if(trimmedValue === 'false' || trimmedValue === 'f') {
            return false;
          } else {
            return null;
          }
        }).filter(value => value !== null);
        return { queryObject: { ...queryObject, values, inverse: true }, queryString };
      } else {
        const values = queryString.split(',').map(value => {
          const trimmedValue = value.trim();
          if(trimmedValue === 'true' || trimmedValue === 't') {
            return true;
          } else if(trimmedValue === 'false' || trimmedValue === 'f') {
            return false;
          } else {
            return null;
          }
        }).filter(value => value !== null);
        return { queryObject: { ...queryObject, values }, queryString };
      }
    }
    return { queryObject, queryString };
  }

  private readonly handleQueryNumber = ({ queryObject, queryString }: QueryParam): QueryParam => {
    if(queryObject.valueType === AssetTypes.AssetFilterValueTypes.NUMBER) {
      return {
        queryObject: { ...queryObject, values: queryString.split(',')
          .map(value => value.trim())
          .filter(value => value.length > 0)
          .map((value) => {
            if(value.indexOf('<=') !== -1) {
              return { operator: 'less than or equal', value: value.substring(2) };
            } else if(value.indexOf('>=') !== -1) {
              return { operator: 'greater than or equal', value: value.substring(2) };
            } else if(value.indexOf('<') !== -1) {
              return { operator: 'less than', value: value.substring(1) };
            } else if(value.indexOf('>') !== -1) {
              return { operator: 'greater than', value: value.substring(1) };
            }  else if(value.indexOf('~') !== -1) {
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
      return { queryObject: {
        ...queryObject, type: 'lengthOverAll', valueType: AssetTypes.AssetFilterValueTypes.NUMBER
      }, queryString: queryString.substring(3) };
    } else if(queryString.indexOf('/p ') === 0) {
      return { queryObject: {
        ...queryObject, type: 'hasLicence', valueType: AssetTypes.AssetFilterValueTypes.BOOLEAN
      }, queryString: queryString.substring(3) };
    }
    return { queryObject, queryString };
  }

  filterKeyUp = (event) => {
    const filterQuery = this.filterQuery.split('&');
    this.lastSentFilterQuery = filterQuery.map(queryPart => {
      const queryResult = this.handleQueryString(
        this.handleQueryBoolean(
          this.handleQueryNumber(
            this.setQueryType({
              queryObject: {
                type: 'name',
                values: [],
                inverse: false,
                valueType: AssetTypes.AssetFilterValueTypes.STRING
              },
              queryString: queryPart.trim()
            })
          )
        )
      );
      return queryResult.queryObject;
    }).filter(queryObject => queryObject.values.length > 0);
    this.filterFunction(this.lastSentFilterQuery);
  }

  generateQueryStringFromFilter(filters: ReadonlyArray<AssetTypes.AssetFilterQuery>) {
    const typeList = { flagstate: 'f', ircs: 'i', cfr: 'c', vesselType: 'v', externalMarking: 'e', lengthOverAll: 'l', hasLicence: 'p' };
    const operatorList = {
      'less than': '< ', 'greater than': '> ', 'almost equal': '~ ', equal: '',
      'greater than or equal': '>=', 'less than or equal': '<=',
    };
    return filters.map(filter => {
      let valueString: string;
      if(filter.valueType === AssetTypes.AssetFilterValueTypes.NUMBER) {
        valueString = filter.values.map(value => {
          return `${operatorList[value.operator]}${value.value}`;
        }).join(',');
      } else {
        valueString = filter.values.join(',');
      }
      if(filter.type === 'name') {
        return `${valueString}`;
      } else {
        return `/${typeList[filter.type]} ${valueString}`;
      }
    }).join(' && ');
  }

  ngOnChanges() {
    if(this.filterQuerySaved.length > 0 && this.lastSentFilterQuery !== this.filterQuerySaved) {
      this.filterQuery = this.generateQueryStringFromFilter(this.filterQuerySaved);
    }
  }
}
