import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { takeWhile, endWith, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';

import { State } from '@app/app-reducer';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';

import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';

@Component({
  selector: 'mobile-terminal-search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public assets: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  public sortedAssets: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  public loadingData = true;
  public tableReadyForDisplay = false;
  public displayedColumns: string[] = ['name', 'ircs', 'mmsi', 'flagstate', 'externalMarking', 'cfr'];

  mapStateToProps() {
    // this.store.select(AssetSelectors.getCurrentAssetList).pipe(takeUntil(this.unmount$)).subscribe((assets) => {
    //   this.loadingData = false;
    //   if(assets.length > 0) {
    //     this.tableReadyForDisplay = true;
    //   }
    //   this.assets = assets;
    //   this.sortedAssets = assets;
    // });
  }

  mapDispatchToProps() {
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.loadingData = true;
    this.tableReadyForDisplay = false;

    const query = {
      assetIds: [null],
    };
    const includeArchived = false;

    this.store.dispatch(MobileTerminalActions.search({ query, includeArchived }));
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  sortData(sort: Sort) {
    const assets = this.assets.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedAssets = assets;
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
}
