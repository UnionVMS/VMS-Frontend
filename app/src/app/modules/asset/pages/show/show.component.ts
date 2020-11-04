import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentTypes, IncidentSelectors } from '@data/incident';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'asset-show-page',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private readonly store: Store<State>, private readonly viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public asset = {} as AssetTypes.Asset;
  public licence$: Observable<AssetTypes.AssetLicence>;
  public incidents$: Observable<ReadonlyArray<IncidentTypes.Incident>>;
  public experimentalFeaturesEnabled$: Observable<boolean>;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(AssetSelectors.getAssetByUrl).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        if(this.asset.id !== asset.id) {
          this.store.dispatch(AssetActions.getLicenceForAsset({ assetId: asset.id }));
          this.store.dispatch(IncidentActions.getIncidentsForAssetId({ assetId: asset.id, onlyOpen: true }));
        }
        this.asset = asset;
      }
    });
    this.incidents$ = this.store.select(IncidentSelectors.getIncidentsForAssets).pipe(map((incidentsByAsset) => {
      return incidentsByAsset[this.asset.id];
    }));
    this.licence$ = this.store.select(AssetSelectors.getLicenceForSelectedAsset);
    this.experimentalFeaturesEnabled$ = this.store.select(UserSettingsSelectors.getExperimentalFeaturesEnabled);
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
