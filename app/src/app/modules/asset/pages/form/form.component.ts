import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { getAlpha3Codes, langs } from 'i18n-iso-countries';
// sasdadsaimsadsaport enLang from 'i18n-iso-countries/langs/en.json';
// countries.registerLocale(enLang);

const allFlagstates = Object.keys(getAlpha3Codes());


import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'asset-edit',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

  constructor(private store: Store<AssetInterfaces.State>) { }

  public assets$: Observable<AssetInterfaces.Asset[]>;
  public loadingData = false;
  public tableReadyForDisplay = false;
  public dataLoadedSubscription: Subscription;
  public flagstates = allFlagstates.sort();
  public assetObject = {
    flagState: '',
    externalMarking: '',
    name: '',
    cfr: '',
    ircs: '',
    imo: '',
    portOfRegistration: '',
    gearFishingType: '',
    mmsi: '',
    licenceType: '',
    lengthOverAll: '',
    grossTonnage: '',
    powerOfMainEngine: '',
    prodOrgName: '',
    prodOrgCode: ''
  };
  public search: () => void;

  mapStateToProps() {
    this.assets$ = this.store.select(AssetSelectors.getCurrentAssetList);
    this.dataLoadedSubscription = this.assets$.subscribe(assets => {
      this.loadingData = false;
      if(assets.length > 0) {
        this.tableReadyForDisplay = true;
      }
    });
  }

  mapDispatchToProps() {
    this.search = () => {
      console.warn(this.assetObject);
      // this.loadingData = true;
      // this.tableReadyForDisplay = false;
      // const searchQuery = Object.keys(this.assetSearchObject).reduce((acc, key) => {
      //   if(typeof this.assetSearchObject[key] === 'string' && this.assetSearchObject[key].length > 0) {
      //     acc[key] = [this.assetSearchObject[key]];
      //   } else if(Array.isArray(this.assetSearchObject[key]) && this.assetSearchObject[key].length > 0) {
      //     acc[key] = this.assetSearchObject[key];
      //   }
      //
      //   return acc;
      // }, {});
      //
      // this.store.dispatch(new AssetActions.SearchAssets(searchQuery));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    // this.store.dispatch(new AssetActions.GetAssetList({pageSize: 30}));
  }

  ngOnDestroy() {
    if(this.dataLoadedSubscription !== undefined) {
      this.dataLoadedSubscription.unsubscribe();
    }
  }
}
