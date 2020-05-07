import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';

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
export class ListPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public loadingData = false;
  public tableReadyForDisplay = false;
  public displayedColumns: string[] = ['Serial No.', 'dnid', 'memberNumber', 'satelliteNumber', 'active', 'asset'];

  public assets: { [assetId: string]: AssetTypes.Asset };
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminals: ReadonlyArray<ExtendedMobileTerminal>;
  public searchMobileTerminals: (query: any, includeArchived: boolean) => void;
  public sortedMobileTerminals: ReadonlyArray<ExtendedMobileTerminal>;

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
      this.sortData({ active: 'Serial No.', direction: 'desc' });
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
      } else {
        this.loadingData = false;
        this.tableReadyForDisplay = true;
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

  sortData(sort: Sort) {
    const mobileTerminals = this.mobileTerminals.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedMobileTerminals = mobileTerminals;
      return;
    }

    this.sortedMobileTerminals = mobileTerminals.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Serial No.': return compareTableSortString(a.serialNo, b.serialNo, isAsc);
        case 'dnid': return compareTableSortNumber(a.defaultDnid, b.defaultDnid, isAsc);
        case 'memberNumber': return compareTableSortNumber(a.defaultMemberNumber, b.defaultMemberNumber, isAsc);
        case 'satelliteNumber': return compareTableSortString(a.satelliteNumber, b.satelliteNumber, isAsc);
        case 'active': return compareTableSortString(a.activeText, b.activeText, isAsc);
        case 'asset': return compareTableSortString(a.assetName, b.assetName, isAsc);
        default: return 0;
      }
    });
  }
}
