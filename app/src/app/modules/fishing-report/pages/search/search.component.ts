import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeWhile, endWith, takeUntil, filter, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';

import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';

import { State } from '@app/app-reducer';

import { FishingReportActions, FishingReportSelectors, FishingReportTypes } from '@data/fishing-report';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'fishing-report-search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public userTimezone$: Observable<string>;
  public searchResult: ReadonlyArray<{
    fishingReport: FishingReportTypes.FishingReport,
    priorNotification: FishingReportTypes.PriorNotification,
  }>;

  public loadingData = false;
  public tableReadyForDisplay = false;
  public displayedColumns: string[] = ['shipCfr', 'status', 'targetSpeciesCode', 'catches', 'estimatedLandingTime', 'createdAt'];
  public search: () => void;
  public searchText: string;

  mapStateToProps() {
    this.store.select(FishingReportSelectors.getLastUserSearchForFishingReportExtended).pipe(takeUntil(this.unmount$)).subscribe(
      (searchResult) => {
        this.loadingData = false;
        if(searchResult.length > 0) {
          this.tableReadyForDisplay = true;
          this.searchResult = searchResult;
        } else {
          this.searchResult = [];
        }
      }
    );
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  mapDispatchToProps() {
    this.search = () => {
      this.loadingData = true;
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
}
