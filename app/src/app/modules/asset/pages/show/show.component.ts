import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        if(this.asset.id !== asset.id) {
          this.store.dispatch(AssetActions.getLicenceForAsset({ assetId: asset.id }));
        }
        this.asset = asset;
      }
    });
    this.licence$ = this.store.select(AssetSelectors.getLicenceForSelectedAsset);
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
