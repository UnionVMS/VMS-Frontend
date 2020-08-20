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
  public searchResult: ReadonlyArray<{
    fishingReport: FishingReportTypes.FishingReport,
    priorNotification: FishingReportTypes.PriorNotification,
    fishingReportCreatedAt: string,
    estimatedLandingTime: string,
  }>;
  public sortedSearchResult: ReadonlyArray<{
    fishingReport: FishingReportTypes.FishingReport,
    priorNotification: FishingReportTypes.PriorNotification,
    fishingReportCreatedAt: string,
    estimatedLandingTime: string,
  }>;
  public loadingData = false;
  public tableReadyForDisplay = false;
  public dataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['shipCfr', 'status', 'targetSpeciesCode', 'catches', 'estimatedLandingTime', 'createdAt'];
  public search: () => void;
  public searchText: string;

  mapStateToProps() {
    this.store.select(FishingReportSelectors.getLastUserSearchForFishingReportExtended).pipe(takeUntil(this.unmount$)).subscribe(
      (searchResult) => {
        console.warn('searchResult: ', searchResult);
        this.loadingData = false;
        if(searchResult.length > 0) {
          this.tableReadyForDisplay = true;
          this.searchResult = searchResult.map(result => ({
            ...result,
            fishingReportCreatedAt: formatUnixtime(result.fishingReport.clientCreatedAt),
            estimatedLandingTime: typeof result.priorNotification !== 'undefined'
              ? formatUnixtime(result.priorNotification.estimatedLandingTime)
              : '-'
          }));
          this.sortedSearchResult = this.searchResult;
        } else {
          this.searchResult = [];
          this.sortedSearchResult = [];
        }
      }
    );
  }

  mapDispatchToProps() {
    this.search = () => {
      this.loadingData = false;
      this.store.dispatch(FishingReportActions.search({ query: { username: this.searchText }, isUserSearch: true }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.searchText = 'fisfri';
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  sortData(sort: Sort) {
    const fishingReports = this.searchResult.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedSearchResult = fishingReports;
      return;
    }

    this.sortedSearchResult = fishingReports.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'shipCfr':
          return compareTableSortString(a.fishingReport.shipCfr, b.fishingReport.shipCfr, isAsc); break;
        case 'status':
          return compareTableSortString(a.fishingReport.status, b.fishingReport.status, isAsc); break;
        case 'targetSpeciesCode':
          return compareTableSortString(a.fishingReport.targetSpeciesCode, b.fishingReport.targetSpeciesCode, isAsc); break;
        case 'catches':
          return compareTableSortNumber(a.fishingReport.fishingCatchIds.length, b.fishingReport.fishingCatchIds.length, isAsc); break;
        case 'estimatedLandingTime':
          return compareTableSortString(a.estimatedLandingTime, b.estimatedLandingTime, isAsc); break;
        case 'createdAt':
          return compareTableSortString(a.fishingReportCreatedAt, b.fishingReportCreatedAt, isAsc); break;
        default: return 0;
      }
    });
  }
}
