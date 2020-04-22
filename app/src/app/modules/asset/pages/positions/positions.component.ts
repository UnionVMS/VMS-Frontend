import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'asset-show-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public asset = {} as AssetTypes.Asset;
  public mergedRoute: RouterTypes.MergedRoute;
  public positions: ReadonlyArray<AssetTypes.Movement>;
  public sortedPositions: ReadonlyArray<AssetTypes.Movement>;

  public displayedColumns: string[] = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'source'];

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        this.asset = asset;
      }
    });
    this.store.select(AssetSelectors.getAssetTracksForSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe((positions) => {
      if(typeof positions === 'undefined') {
        this.positions = [];
      } else {
        this.positions = positions.tracks.map(position => ({
          ...position,
          formattedTimestamp: formatUnixtime(position.timestamp),
          formattedSpeed: position.speed.toFixed(2)
        }));
        this.sortedPositions = this.positions;
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getNrOfTracksForAsset({
          assetId: this.mergedRoute.params.assetId,
          amount: 20,
          sources: ['INMARSAT_C'],
        }));
      }
    });
  }

  mapDispatchToProps() {
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.getSelectedAsset());
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  sortData(sort: Sort) {
    const positions = this.positions.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedPositions = positions;
      return;
    }

    this.sortedPositions = positions.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'timestamp': return compareTableSortNumber(a.timestamp, b.timestamp, isAsc);
        case 'latitude': return compareTableSortNumber(a.location.latitude, b.location.latitude, isAsc);
        case 'longitude': return compareTableSortNumber(a.location.longitude, b.location.longitude, isAsc);
        case 'speed': return compareTableSortNumber(a.speed, b.speed, isAsc);
        case 'heading': return compareTableSortNumber(a.heading, b.heading, isAsc);
        case 'source': return compareTableSortString(a.source, b.source, isAsc);
        default: return 0;
      }
    });
  }
}
