import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { FishingReportTypes, FishingReportActions, FishingReportSelectors } from '@data/fishing-report';

@Component({
  selector: 'fishing-report-show-page',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public fishingReport = {} as FishingReportTypes.FishingReport;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(FishingReportSelectors.getFishingReportByUrl).pipe(takeUntil(this.unmount$)).subscribe((fishingReport) => {
      if(typeof fishingReport !== 'undefined') {
        this.fishingReport = fishingReport;
      }
    });
  }

  mapDispatchToProps() {
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(FishingReportActions.getFishingReportByUrl());
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }
}
