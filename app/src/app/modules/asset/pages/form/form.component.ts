import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith, map, take } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { getAlpha3Codes, langs } from 'i18n-iso-countries';
import { errorMessage } from '@app/helpers/validators/error-messages';
// import enLang from 'i18n-iso-countries/langs/en.json';
// countries.registerLocale(enLang);

import { createAssetFormValidator } from './form-validator';

const allFlagstates = Object.keys(getAlpha3Codes());

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { NotificationsTypes, NotificationsActions } from '@data/notifications';
import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'asset-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public asset = {} as AssetTypes.Asset;
  public assetSubscription: Subscription;
  public unitTonnagesSubscription: Subscription;
  public unitTonnages: ReadonlyArray<AssetTypes.UnitTonnage>;
  public flagstates = allFlagstates.sort();
  public assetObject = {} as AssetTypes.Asset;
  public formValidator: FormGroup;
  public save: () => void;
  public mergedRoute: RouterTypes.MergedRoute;

  mapStateToProps() {
    this.unitTonnagesSubscription = this.store.select(AssetSelectors.getUnitTonnages).subscribe((unitTonnages) => {
      this.unitTonnages = unitTonnages;
      if(
        unitTonnages.length > 0 && (
          typeof this.assetObject.grossTonnageUnit === 'undefined' ||
          this.assetObject.grossTonnageUnit === null
        )
      ) {
        this.assetObject = {
          ...this.assetObject,
          grossTonnageUnit: unitTonnages[0].code
        };
      }
    });
    this.assetSubscription = this.store.select(AssetSelectors.getSelectedAsset).subscribe((asset: AssetTypes.Asset) => {
      if(typeof asset !== 'undefined') {
        this.asset = asset;
      }
      this.formValidator = createAssetFormValidator(this.asset);
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
  }

  mapDispatchToProps() {
    this.save = () => {
      this.store.dispatch(AssetActions.saveAsset({ asset: {
        ...this.asset,
        flagStateCode: this.formValidator.value.essentailFields.flagState,
        externalMarking: this.formValidator.value.essentailFields.externalMarking,
        name: this.formValidator.value.essentailFields.name,
        cfr: this.formValidator.value.identificationFields.cfr,
        ircs: this.formValidator.value.identificationFields.ircs,
        imo: this.formValidator.value.identificationFields.imo,
        portOfRegistration: this.formValidator.value.identificationFields.portOfRegistration,
        mmsi: this.formValidator.value.identificationFields.mmsi,
        lengthOverAll: this.formValidator.value.metrics.lengthOverAll,
        lengthBetweenPerpendiculars: this.formValidator.value.metrics.lengthBetweenPerpendiculars,
        grossTonnage: this.formValidator.value.metrics.grossTonnage,
        grossTonnageUnit: this.formValidator.value.metrics.grossTonnageUnit,
        powerOfMainEngine: this.formValidator.value.metrics.powerOfMainEngine,
        prodOrgName: this.formValidator.value.companyInformation.prodOrgName,
        prodOrgCode: this.formValidator.value.companyInformation.prodOrgCode,
      }}));
    };
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
    if(this.assetSubscription !== undefined) {
      this.assetSubscription.unsubscribe();
    }
  }

  isCreate() {
    return typeof this.mergedRoute.params.assetId === 'undefined';
  }

  isFormReady() {
    return this.isCreate() || Object.entries(this.asset).length !== 0;
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }
}
