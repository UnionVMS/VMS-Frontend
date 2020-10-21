import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'asset-show-positions-page',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public asset = {} as AssetTypes.Asset;
  public mergedRoute: RouterTypes.MergedRoute;
  public positions$: Observable<ReadonlyArray<AssetTypes.Movement>>;
  public userTimezone$: Observable<string>;

  public coordinateFormat: FormControl = new FormControl('DDM');

  public displayedColumns: string[] = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'formattedOceanRegion', 'status'];

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(AssetSelectors.getAssetByUrl).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        this.asset = asset;
      }
    });
    this.positions$ = this.store.select(AssetSelectors.getLastFullPositionsForUrlAsset);
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
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
}
