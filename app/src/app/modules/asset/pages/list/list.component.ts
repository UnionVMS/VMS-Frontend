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

  mapStateToProps() {}

  mapDispatchToProps() {}

  ngOnInit() {
    console.warn('---');
    this.store.dispatch(new AssetActions.GetAssetList());
    console.warn('---');
  }

  ngOnDestroy() {}

}
