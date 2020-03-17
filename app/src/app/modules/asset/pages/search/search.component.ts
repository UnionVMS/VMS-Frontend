import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { takeWhile, endWith, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { getAlpha3Codes, langs } from 'i18n-iso-countries';
import { Sort } from '@angular/material/sort';
// import enLang from 'i18n-iso-countries/langs/en.json';
// countries.registerLocale(enLang);
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
const allFlagstates = Object.keys(getAlpha3Codes());


import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'asset-search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<AssetInterfaces.State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public assets: AssetInterfaces.Asset[];
  public sortedAssets: AssetInterfaces.Asset[];
  public loadingData = false;
  public tableReadyForDisplay = false;
  public dataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['name', 'ircs', 'mmsi', 'flagstate', 'externalMarking', 'cfr'];
  public flagstates = allFlagstates.sort();
  public assetSearchObject = {
    search: '',
    serachType: 'Swedish Assets',
    flagState: [],

    // externalMarking: '',
    // name: '',
    // cfr: '',
    // ircs: '',
  };
  public search: () => void;

  mapStateToProps() {
    this.store.select(AssetSelectors.getCurrentAssetList).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
      this.loadingData = false;
      if(assets.length > 0) {
        this.tableReadyForDisplay = true;
      }
      this.assets = assets;
      this.sortedAssets = assets;
    });
  }

  mapDispatchToProps() {
    this.search = () => {
      this.loadingData = true;
      this.tableReadyForDisplay = false;

      let searchQuery = {
        fields: [],
        logicalAnd: true
      };

      if(this.assetSearchObject.serachType === 'Swedish Assets') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              searchField: 'FLAG_STATE',
              searchValue: 'SWE'
            }
          ]
        };
      } else if(this.assetSearchObject.serachType === 'VMS') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              searchField: 'FLAG_STATE',
              searchValue: 'SWE'
            },
            {
              searchField: 'MIN_LENGTH',
              searchValue: '12'
            },
            {
              searchField: 'VESSEL_TYPE',
              searchValue: 'fishing'
            },
          ]
        };
      } else if(this.assetSearchObject.serachType === 'other') {
        searchQuery = { ...searchQuery,
          fields: [ ...searchQuery.fields,
            {
              fields: this.assetSearchObject.flagState.map(flagstate => ({
                searchField: 'FLAG_STATE',
                searchValue: flagstate
              })),
              logicalAnd: false
            }
          ]
        };
      }

      if(this.assetSearchObject.search > '') {
        const searchFields = ['NAME', 'EXTERNAL_MARKING', 'CFR', 'IRCS'];
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

      this.store.dispatch(AssetActions.searchAssets({ searchQuery }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    // this.store.dispatch(AssetActions.getAssetList({pageSize: 30}));
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  sortData(sort: Sort) {
    const assets = this.assets.slice();
    console.warn(this.assets, assets);
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
}
