import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith } from 'rxjs/operators';
// import { countries } from 'i18n-iso-countries';
// import { enLang } from 'i18n-iso-countries/langs/en.json';
// countries.registerLocale(enLang);
// console.log(countries.getAlpha3Codes());

import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'asset-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  constructor(private store: Store<AssetInterfaces.State>) { }

  public assets$: Observable<AssetInterfaces.Asset[]>;
  public initialDataLoaded = false;
  public initialDataLoadedSubscription: Subscription;
  public displayedColumns: string[] = ['name', 'ircs', 'mmsi', 'flagstate', 'externalMarking', 'cfr', 'details'];

  //
  // cfr
  // Edit / Show (Details) IF source === 'NATIONAL' READ ONLY



  mapStateToProps() {
    this.assets$ = this.store.select(AssetSelectors.getCurrentAssetList);
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
    this.store.dispatch(new AssetActions.GetAssetList({pageSize: 30}));
  }

  ngOnDestroy() {
    if(this.initialDataLoadedSubscription !== undefined) {
      this.initialDataLoadedSubscription.unsubscribe();
    }
  }

}
