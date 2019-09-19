import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { getAlpha3Codes, langs } from 'i18n-iso-countries';
// import enLang from 'i18n-iso-countries/langs/en.json';
// countries.registerLocale(enLang);

const allFlagstates = Object.keys(getAlpha3Codes());

import { State } from '@app/app-reducer';
import { AssetInterfaces, AssetActions, AssetSelectors } from '@data/asset';

@Component({
  selector: 'asset-edit',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public unitTonnagesSubscription: Subscription;
  public unitTonnages: Array<AssetInterfaces.UnitTonnage>;
  public flagstates = allFlagstates.sort();
  public assetObject = {} as AssetInterfaces.Asset;
  public save: () => void;

  mapStateToProps() {
    this.unitTonnagesSubscription = this.store.select(AssetSelectors.getUnitTonnages).subscribe((unitTonnages) => {
      this.unitTonnages = unitTonnages;
      if(
        unitTonnages.length > 0 && (
          typeof this.assetObject.grossTonnageUnit === 'undefined' ||
          this.assetObject.grossTonnageUnit === null
        )
      ) {
        this.assetObject.grossTonnageUnit = unitTonnages[0].code;
      }
    });
    this.store.select(AssetSelectors.getSelectedAsset).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        this.assetObject = asset;
      }
    });
  }

  mapDispatchToProps() {
    this.save = () =>
      this.store.dispatch(AssetActions.saveAsset({ asset: this.assetObject }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.getUnitTonnage());
    this.store.dispatch(AssetActions.getSelectedAsset());
  }

  ngOnDestroy() {
    if(this.unitTonnagesSubscription !== undefined) {
      this.unitTonnagesSubscription.unsubscribe();
    }
  }
}
