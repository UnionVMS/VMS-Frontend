import { Component, Input, OnChanges } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { FishingReportActions, FishingReportSelectors, FishingReportTypes } from '@data/fishing-report';

@Component({
  selector: 'fishing-report-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges {

  @Input() userTimezone: string;
  @Input() searchResult: ReadonlyArray<{
    fishingReport: FishingReportTypes.FishingReport,
    priorNotification: FishingReportTypes.PriorNotification,
  }>;


  public formattedSearchResult: ReadonlyArray<{
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

  public displayedColumns: string[] = ['shipCfr', 'status', 'targetSpeciesCode', 'catches', 'estimatedLandingTime', 'createdAt'];

  ngOnChanges() {
    if(this.searchResult.length > 0) {
      this.formattedSearchResult = this.searchResult.map(result => ({
        ...result,
        fishingReportCreatedAt: formatUnixtime(result.fishingReport.clientCreatedAt),
        estimatedLandingTime: typeof result.priorNotification !== 'undefined'
          ? formatUnixtime(result.priorNotification.estimatedLandingTime)
          : '-'
      }));
      this.sortedSearchResult = this.formattedSearchResult;
    }
  }

  sortData(sort: Sort) {
    const fishingReports = this.formattedSearchResult.slice();
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
