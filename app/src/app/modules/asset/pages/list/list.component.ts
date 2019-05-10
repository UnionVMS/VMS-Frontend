import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith } from 'rxjs/operators';

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'map-realtime',
  templateUrl: './list.component.html',
  // styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  constructor(private store: Store<AssetInterfaces.State>) { }

  public assets$: Observable<AssetInterfaces.Asset[]>;
  public initialDataLoaded = false;
  public initialDataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['name', 'ircs', 'mmsi'];

  mapStateToProps() {
    this.assets$ = this.store.select(AssetSelectors.getAssets);
    this.initialDataLoadedSubscription = this.assets$
      .pipe(
        takeWhile(assets => assets.length === 0),
        endWith([{}])
      )
      .subscribe(assets => {
        if(assets.length > 0) {
          this.initialDataLoaded = true;
        }
      });
  }

  mapDispatchToProps() {}

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(new AssetActions.GetAssetList());
  }

  ngOnDestroy() {
    if(this.initialDataLoadedSubscription !== undefined) {
      this.initialDataLoadedSubscription.unsubscribe();
    }
  }

}
