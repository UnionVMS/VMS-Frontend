import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Sort } from '@angular/material/sort';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';

type ExtendedMovement = Readonly<AssetTypes.FullMovement & {
  formattedTimestamp: string;
  formattedSpeed: string,
  formattedOceanRegion: string;
}>;

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
  public positions: ReadonlyArray<ExtendedMovement>;
  public sortedPositions: ReadonlyArray<ExtendedMovement>;

  public coordinateFormat: FormControl = new FormControl('DDM');

  public displayedColumns: string[] = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'formattedOceanRegion', 'status'];

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
    this.store.select(AssetSelectors.getLastFullPositionsForSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe(
      (positions: ReadonlyArray<AssetTypes.FullMovement>) => {
        if(typeof positions === 'undefined') {
          this.positions = [];
        } else {
          const oceanRegionTranslation = {
            AORE: 'East Atlantic',
            AORW: 'West Atlantic',
            POR: 'Pacific',
            IOR: 'Indian'
          };
          this.positions = positions.map(position => ({
            ...position,
            locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude),
            formattedTimestamp: formatUnixtime(position.timestamp),
            formattedSpeed: position.speed.toFixed(2),
            formattedOceanRegion: oceanRegionTranslation[position.sourceSatelliteId]
          }));
          this.sortData({ active: 'timestamp', direction: 'desc' });
        }
      }
    );
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getLastFullPositionsForAsset({
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
        case 'formattedOceanRegion': return compareTableSortString(a.formattedOceanRegion, b.formattedOceanRegion, isAsc);
        case 'status': return compareTableSortString(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }
}
