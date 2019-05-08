import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'map-realtime',
  templateUrl: './list.component.html',
  // styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  constructor(private store: Store<AssetInterfaces.State>) { }

  private assets$: Observable<AssetInterfaces.Asset[]>;

  mapStateToProps() {
    this.assets$ = this.store.select(AssetSelectors.getAssets);
  }

  mapDispatchToProps() {}

  ngOnInit() {
    this.store.dispatch(new AssetActions.GetAssetList());
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {}

}
