import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
// @ts-ignore
import moment from 'moment-timezone';

import { State } from '@app/app-reducer';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';

import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';

type ExtendedMobileTerminal = Readonly<MobileTerminalTypes.MobileTerminal & {
  defaultDnid: number;
  defaultMemberNumber: number;
  activeText: string;
  assetName: string;
}>;

@Component({
  selector: 'mobile-terminal-list-page',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public loadingData = false;
  public tableReadyForDisplay = false;
  public displayedColumns: string[] = ['serialNo', 'defaultDnid', 'defaultMemberNumber', 'satelliteNumber', 'active', 'assetName'];

  public assets: { [assetId: string]: AssetTypes.Asset };
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminals: ReadonlyArray<ExtendedMobileTerminal>;
  public filteredMobileTerminals: ReadonlyArray<ExtendedMobileTerminal>;
  public searchMobileTerminals: (query: any, includeArchived: boolean) => void;
  public sortedMobileTerminals: ReadonlyArray<ExtendedMobileTerminal>;

  public filterObject =  {
    serialNo: '',
    showOnlyActive: false
  };

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(AssetSelectors.getCurrentAssetList).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults.length !== 0 && typeof this.mobileTerminals !== 'undefined')
    ).subscribe((searchResults) => {
      this.assets = searchResults.reduce((acc, asset) => ({ ...acc, [asset.id]: asset }), {});
      this.mobileTerminals = this.mobileTerminals.map((mobileTerminal): ExtendedMobileTerminal => ({
        ...mobileTerminal,
        assetName: typeof this.assets[mobileTerminal.assetId] !== 'undefined' ? this.assets[mobileTerminal.assetId].name : ''
      }));
      this.filter();
      this.loadingData = false;
      this.tableReadyForDisplay = true;
    });
    this.store.select(MobileTerminalSelectors.getLastSearchResult).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults !== undefined)
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
      }

      this.mobileTerminals = searchResults.map((mobileTerminal): ExtendedMobileTerminal => {
        const defaultChannel = mobileTerminal.channels.find((channel: MobileTerminalTypes.Channel) => channel.defaultChannel === true);
        return {
          ...mobileTerminal,
          defaultDnid: typeof defaultChannel !== 'undefined' ? defaultChannel.dnid : undefined,
          defaultMemberNumber: typeof defaultChannel !== 'undefined' ? defaultChannel.memberNumber : undefined,
          activeText: mobileTerminal.active ? 'Active' : 'Inactive',
          assetName: undefined
        };
      });

      if(assetIds.length === 0) {
        this.filter();
        this.loadingData = false;
        this.tableReadyForDisplay = true;
      }
    });
  }

  mapDispatchToProps() {
    this.searchMobileTerminals = (query: any, includeArchived: boolean) =>
      this.store.dispatch(MobileTerminalActions.search({ query, includeArchived, saveAsSearchResult: true }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();

    this.loadingData = true;
    this.tableReadyForDisplay = false;
    this.searchMobileTerminals({ }, true);
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  filter() {
    this.filteredMobileTerminals = this.mobileTerminals;
    if(this.filterObject.showOnlyActive === true) {
      this.filteredMobileTerminals = this.mobileTerminals.filter((mobileTerminal) => mobileTerminal.active);
    }
    if(this.filterObject.serialNo.length !== 0) {
      this.filteredMobileTerminals = this.filteredMobileTerminals.filter(
        (mobileTerminal) => mobileTerminal.serialNo.includes(this.filterObject.serialNo)
      );
    }
    this.sortData({ active: 'serialNo', direction: 'desc' });
  }

  sortData(sort: Sort) {
    const mobileTerminals = this.filteredMobileTerminals.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedMobileTerminals = mobileTerminals;
      return;
    }

    this.sortedMobileTerminals = mobileTerminals.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'serialNo': return compareTableSortString(a.serialNo, b.serialNo, isAsc);
        case 'defaultDnid': return compareTableSortNumber(a.defaultDnid, b.defaultDnid, isAsc);
        case 'defaultMemberNumber': return compareTableSortNumber(a.defaultMemberNumber, b.defaultMemberNumber, isAsc);
        case 'satelliteNumber': return compareTableSortString(a.satelliteNumber, b.satelliteNumber, isAsc);
        case 'active': return compareTableSortString(a.activeText, b.activeText, isAsc);
        case 'assetName': return compareTableSortString(a.assetName, b.assetName, isAsc);
        default: return 0;
      }
    });
  }

  exportToCSV() {
    const nrOfColumns = this.displayedColumns.length;
    const nrOfRows = this.sortedMobileTerminals.length;
    let csv = this.displayedColumns.reduce((csvRow, column, index) => {
      return csvRow + column + (nrOfColumns !== index + 1 ? ';' : '');
    }, '') + '\r\n';

    csv = csv + this.sortedMobileTerminals.reduce((acc, mobileTerminal, mtIndex) => {
      return acc + this.displayedColumns.reduce((csvRow, column, index) => {
        return csvRow +
          (typeof mobileTerminal[column] !== 'undefined' ? mobileTerminal[column] : '') +
          (nrOfColumns !== index + 1 ? ';' : '');
      }, '') + (nrOfRows !== mtIndex + 1 ? '\r\n' : '');
    }, '');

    const exportedFilenmae = 'mobileTerminals.' + moment().format('YYYY-MM-DD.HH_mm') + '.csv';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
