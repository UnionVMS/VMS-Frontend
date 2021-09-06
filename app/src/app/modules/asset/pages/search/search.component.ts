import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { takeWhile, endWith, takeUntil, filter, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { getAlpha3Codes, langs, getNames, registerLocale, alpha2ToAlpha3 } from 'i18n-iso-countries';
import { Sort } from '@angular/material/sort';
// @ts-ignore
import moment from 'moment-timezone';
// import sv from 'i18n-iso-countries/langs/sv.json';
// import en from 'i18n-iso-countries/langs/en.json';
// import fi from 'i18n-iso-countries/langs/fi.json';
// registerLocale(sv);
// registerLocale(en);
// registerLocale(fi);

import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
// const allFlagstates = Object.keys(getAlpha3Codes());
const allCountries = getNames('en');
const allCountryCodes = Object.entries(allCountries).reduce((obj, [key, value]) => ({ ...obj, [value]: alpha2ToAlpha3(key) }), { });

import { State } from '@app/app-reducer';

import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'asset-search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  @ViewChild('toolbox') toolbox;

  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public assets: ReadonlyArray<AssetTypes.Asset>;
  public sortedAssets: ReadonlyArray<AssetTypes.Asset>;
  public loadingData = false;
  public tableReadyForDisplay = false;
  public dataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['externalMarking', 'ircs', 'name', 'cfr', 'flagstate', 'mmsi'];
  public assetSearchObject = {
    search: '',
    searchType: 'Swedish Assets',
    flagState: [],
  };
  public search: () => void;
  public clearSearch: () => void;
  public commonCountries = ['Sweden', 'Finland', 'Denmark', 'Estonia', 'Norway'].sort();
  public allCountryCodes = allCountryCodes;
  public flagstates = Object.values(allCountries).sort().filter(flagstate => !this.commonCountries.includes(flagstate));

  mapStateToProps() {
    this.store.select(AssetSelectors.getLastUserAssetSearch).pipe(
      filter(lastSearch => lastSearch !== null), take(1)
    ).subscribe((lastUserAssetSearch) => {
      if(lastUserAssetSearch !== null) {
        this.store.dispatch(AssetActions.setCurrentAssetList({ assetListIdentifier: lastUserAssetSearch }));
      }
      this.store.select(AssetSelectors.getCurrentAssetList).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
        this.loadingData = false;
        if(assets.length > 0) {
          this.tableReadyForDisplay = true;
        }
        this.assets = assets;
        this.sortedAssets = assets;
      });
      this.store.select(AssetSelectors.getCurrentAssetListSearchQuery).pipe(
        takeUntil(this.unmount$),
        filter(searchQuery => searchQuery !== null)
      ).subscribe((searchQuery) => {
        let searchQueryIncluded = true;

        // @ts-ignore:next-line
        if([1, 2].includes(searchQuery.fields.length) && searchQuery.fields[0].searchValue === 'SWE') {
          this.assetSearchObject = { ...this.assetSearchObject, searchType: 'Swedish Assets' };
          if(searchQuery.fields.length === 1) {
            searchQueryIncluded = false;
          }
          // @ts-ignore:next-line
        } else if([3, 4].includes(searchQuery.fields.length) && searchQuery.fields[0].searchValue === 'SWE') {
          this.assetSearchObject = { ...this.assetSearchObject, searchType: 'VMS' };
          if(searchQuery.fields.length === 3) {
            searchQueryIncluded = false;
          }
        } else {
          const flagStateSearch = searchQuery.fields[0] as AssetTypes.AssetListSearchQuery;
          this.assetSearchObject = {
            ...this.assetSearchObject,
            searchType: 'other',
            flagState: flagStateSearch.fields.map((flagstateField: AssetTypes.AssetListSearchQueryField) => flagstateField.searchValue)
          };
          if(searchQuery.fields.length === 1) {
            searchQueryIncluded = false;
          }
        }

        if(searchQueryIncluded) {
          const searchStringQuery = searchQuery.fields[searchQuery.fields.length - 1] as AssetTypes.AssetListSearchQuery;
          let search: string;
          if(searchStringQuery.logicalAnd === true) {
            search = searchStringQuery.fields.reduce((searchString: string, query: AssetTypes.AssetListSearchQuery) => {
              searchString += ' && ' + (query.fields[0] as AssetTypes.AssetListSearchQueryField).searchValue;
              return searchString;
            }, '').substring(4);
          } else {
            search = (searchStringQuery.fields[0] as AssetTypes.AssetListSearchQueryField).searchValue as string;
          }
          this.assetSearchObject = {
            ...this.assetSearchObject,
            search
          };
        }
      });
    });
  }

  mapDispatchToProps() {
    this.search = () => {
      this.loadingData = true;
      this.tableReadyForDisplay = false;

      let searchQuery: AssetTypes.AssetListSearchQuery = {
        fields: [],
        logicalAnd: true
      };

      if(this.assetSearchObject.searchType === 'Swedish Assets') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              searchField: 'flagStateCode',
              searchValue: 'SWE'
            }
          ]
        };
      } else if(this.assetSearchObject.searchType === 'VMS') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              searchField: 'flagStateCode',
              searchValue: 'SWE'
            },
            {
              searchField: 'mobileTerminals',
              searchValue: 'true',
            },
            {
              searchField: 'vesselType',
              searchValue: 'fishing'
            },
          ]
        };
      } else if(this.assetSearchObject.searchType === 'other') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              fields: this.assetSearchObject.flagState.map(flagstate => ({
                searchField: 'flagStateCode',
                searchValue: flagstate
              })),
              logicalAnd: false
            }
          ]
        };
      }

      if(this.assetSearchObject.search > '') {
        const searchFields = ['name', 'externalMarking', 'cfr', 'ircs', 'mmsi'];
        const splitSearch = this.assetSearchObject.search.split('&&');

        const searchStringQuery = {
          fields: splitSearch.map(searchString => ({
            fields: searchFields.map(searchField => {
              return {
                searchField,
                searchValue: searchString.trim(),
              };
            }),
            logicalAnd: false
          })),
          logicalAnd: true
        };

        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            (splitSearch.length > 1 ? searchStringQuery : searchStringQuery.fields[0]),
          ]
        };
      }

      this.store.dispatch(AssetActions.searchAssets({ searchQuery, userSearch: true }));
    };

    this.clearSearch = () => this.store.dispatch(AssetActions.clearAssetSearch());
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  clear() {
    this.assetSearchObject = {
      search: '',
      searchType: 'Swedish Assets',
      flagState: [],
    };
    this.clearSearch();
  }

  sortData(sort: Sort) {
    const assets = this.assets.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedAssets = assets;
      return;
    }

    this.sortedAssets = assets.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compareTableSortString(a.name, b.name, isAsc);
        case 'ircs': return compareTableSortString(a.ircs, b.ircs, isAsc);
        case 'mmsi': return compareTableSortNumber(a.mmsi as unknown as number, b.mmsi as unknown as number, isAsc);
        case 'flagstate': return compareTableSortString(a.flagStateCode, b.flagStateCode, isAsc);
        case 'externalMarking': return compareTableSortString(a.externalMarking, b.externalMarking, isAsc);
        case 'cfr': return compareTableSortString(a.cfr, b.cfr, isAsc);
        default: return 0;
      }
    });
  }

  exportAssetsToCSV() {
    const nrOfColumns = this.displayedColumns.length;
    const nrOfRows = this.sortedAssets.length;
    let csv = this.displayedColumns.reduce((csvRow, column, index) => {
      return csvRow + column + (nrOfColumns !== index + 1 ? ';' : '');
    }, '') + '\r\n';

    csv = csv + this.sortedAssets.reduce((acc, asset, mtIndex) => {
      return acc + this.displayedColumns.reduce((csvRow, column, index) => {
        const fieldName = (column === 'status' ? 'statusText' : column);
        return csvRow +
          (typeof asset[fieldName] !== 'undefined' ? asset[fieldName] : '') +
          (nrOfColumns !== index + 1 ? ';' : '');
      }, '') + (nrOfRows !== mtIndex + 1 ? '\r\n' : '');
    }, '');

    const exportedFilenmae = 'assets.' + moment().format('YYYY-MM-DD.HH_mm') + '.csv';

    const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFilenmae);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
