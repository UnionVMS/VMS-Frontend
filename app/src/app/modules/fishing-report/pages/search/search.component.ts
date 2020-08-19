import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Subject } from 'rxjs';
import { takeWhile, endWith, takeUntil, filter, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';

import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { State } from '@app/app-reducer';

import { FishingReportActions, FishingReportSelectors, FishingReportTypes } from '@data/fishing-report';

@Component({
  selector: 'fishing-report-search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public fishingReports: ReadonlyArray<FishingReportTypes.FishingReport>;
  public sortedFishingReports: ReadonlyArray<FishingReportTypes.FishingReport>;
  public loadingData = false;
  public tableReadyForDisplay = false;
  public dataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['shipCfr', 'targetSpeciesCode', 'catches', 'createdAt'];
  public search: () => void;
  public searchText: string;

  mapStateToProps() {
    this.store.select(FishingReportSelectors.getFishingReports).pipe(takeUntil(this.unmount$)).subscribe((fishingReports) => {
      this.loadingData = false;
      if(Object.keys(fishingReports).length > 0) {
        this.tableReadyForDisplay = true;
      }
      this.fishingReports = fishingReports.map(fishingReport => ({
        ...fishingReport,
        createdAt: formatUnixtime(fishingReport.clientCreatedAt)
      }));
      this.sortedFishingReports = this.fishingReports;
      console.warn(fishingReports);
    });
  }

  mapDispatchToProps() {
    this.search = () => {
      this.loadingData = false;
      this.store.dispatch(FishingReportActions.search({ query: {} }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  sortData(sort: Sort) {
    const fishingReports = this.fishingReports.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedFishingReports = fishingReports;
      return;
    }

    this.sortedFishingReports = fishingReports.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        // case 'name': return compareTableSortString(a.name, b.name, isAsc);
        // case 'ircs': return compareTableSortString(a.ircs, b.ircs, isAsc);
        // case 'mmsi': return compareTableSortNumber(a.mmsi as unknown as number, b.mmsi as unknown as number, isAsc);
        // case 'flagstate': return compareTableSortString(a.flagStateCode, b.flagStateCode, isAsc);
        // case 'externalMarking': return compareTableSortString(a.externalMarking, b.externalMarking, isAsc);
        // case 'cfr': return compareTableSortString(a.cfr, b.cfr, isAsc);
        default: return 0;
      }
    });
  }
}
