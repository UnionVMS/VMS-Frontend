import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';

import { State } from '@app/app-reducer';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';

import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterInterfaces, RouterSelectors } from '@data/router';

@Component({
  selector: 'mobile-terminal-attach-page',
  templateUrl: './attach.component.html',
  styleUrls: ['./attach.component.scss']
})
export class AttachPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public loadingData = false;
  public tableReadyForDisplay = false;
  public displayedColumns: string[] = ['Serial No.', 'status', 'attach'];

  public assets: { [assetId: string]: AssetInterfaces.Asset };
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminals: ReadonlyArray<MobileTerminalInterfaces.MobileTerminal>;
  public mergedRoute: RouterInterfaces.MergedRoute;
  public serialNo: FormControl;
  public lastSearchedSerialNo: string;
  public searchMobileTerminals: (query: any, includeArchived: boolean) => void;
  public sortedMobileTerminals: ReadonlyArray<MobileTerminalInterfaces.MobileTerminal>;

  public createWithSerialNo: (serialNo: string) => void;
  public saveMobileTerminal: (mobileTerminal: MobileTerminalInterfaces.MobileTerminal) => void;

  mapStateToProps() {
    this.store.select(AssetSelectors.getCurrentAssetList).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults.length !== 0 && typeof this.lastSearchedSerialNo !== 'undefined')
    ).subscribe((searchResults) => {
      this.loadingData = false;
      this.tableReadyForDisplay = true;
      this.assets = searchResults.reduce((acc, asset) => ({ ...acc, [asset.id]: asset }), {});
    });
    this.store.select(MobileTerminalSelectors.getLastSearchResult).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults !== undefined && typeof this.lastSearchedSerialNo !== 'undefined')
    ).subscribe((searchResults) => {
      const assetIds = searchResults.reduce((acc, searchResult) => {
        if(typeof searchResult.assetId !== 'undefined' && searchResult.assetId !== null) {
          acc = [ ...acc, searchResult.assetId ];
        }
        return acc;
      }, []);

      if(assetIds.length !== 0) {
        this.store.dispatch(AssetActions.searchAssets({ searchQuery: {
          fields: assetIds.map(assetId => ({
            searchField: 'GUID',
            searchValue: assetId
          })),
          logicalAnd: false
        } }));
      } else {
        this.loadingData = false;
        this.tableReadyForDisplay = true;
      }

      this.mobileTerminals = searchResults;
      this.sortedMobileTerminals = searchResults;
    });

    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
  }

  mapDispatchToProps() {
    this.searchMobileTerminals = (query: any, includeArchived: boolean) =>
      this.store.dispatch(MobileTerminalActions.search({ query, includeArchived, saveAsSearchResult: true }));
    this.saveMobileTerminal = (mobileTerminal: MobileTerminalInterfaces.MobileTerminal) =>
      this.store.dispatch(MobileTerminalActions.saveMobileTerminal({ mobileTerminal }));
    this.createWithSerialNo = (serialNo: string) =>
      this.store.dispatch(MobileTerminalActions.createWithSerialNo({ serialNo }));
  }

  ngOnInit() {
    const alphanumericWithHyphenAndSpaceTest = (c: FormControl) => {
      const REGEXP = /^[a-z0-9\- ]*$/i;
      return c.value === null || c.value.length === 0 || REGEXP.test(c.value) ? null : {
        validateAlphanumericHyphenAndSpace: true
      };
    };
    this.serialNo = new FormControl('', [Validators.required, alphanumericWithHyphenAndSpaceTest]);

    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  search() {
    this.loadingData = true;
    this.tableReadyForDisplay = false;
    this.lastSearchedSerialNo = this.serialNo.value;
    this.searchMobileTerminals({ serialNumbers: [this.serialNo.value] }, true);
  }

  errorMessage() {
    if (this.serialNo.hasError('required')) {
      return 'You must enter a value';
    }

    return this.serialNo.hasError('validateAlphanumericHyphenAndSpace') ? 'Not a valid serial number' : '';
  }

  sortData(sort: Sort) {
    const mobileTerminals = this.mobileTerminals.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedMobileTerminals = mobileTerminals;
      return;
    }
    //
    // this.sortedAssets = assets.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //     case 'name': return compareTableSortString(a.name, b.name, isAsc);
    //     case 'ircs': return compareTableSortString(a.ircs, b.ircs, isAsc);
    //     case 'mmsi': return compareTableSortNumber(a.mmsi as unknown as number, b.mmsi as unknown as number, isAsc);
    //     case 'flagstate': return compareTableSortString(a.flagStateCode, b.flagStateCode, isAsc);
    //     case 'externalMarking': return compareTableSortString(a.externalMarking, b.externalMarking, isAsc);
    //     case 'cfr': return compareTableSortString(a.cfr, b.cfr, isAsc);
    //     default: return 0;
    //   }
    // });
  }

  noPreviousExistingMobileTerminal() {
    return typeof this.mobileTerminals !== 'undefined' &&
      this.mobileTerminals.some(mobileTerminal => mobileTerminal.serialNo === this.lastSearchedSerialNo);
  }

  attach(mobileTerminal: MobileTerminalInterfaces.MobileTerminal) {
    this.saveMobileTerminal({
      ...mobileTerminal,
      assetId: this.mergedRoute.params.assetId
    });
  }
}
