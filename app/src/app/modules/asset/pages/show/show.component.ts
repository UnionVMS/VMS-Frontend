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
import { MobileTerminalInterfaces, MobileTerminalSelectors } from '@data/mobile-terminal';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';

@Component({
  selector: 'asset-show-page',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public assetSubscription: Subscription;
  public mobileTerminals$: Observable<Array<MobileTerminalInterfaces.MobileTerminal>>;
  public asset = {} as AssetInterfaces.Asset;

  mapStateToProps() {
    this.assetSubscription = this.store.select(AssetSelectors.getSelectedAsset).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        this.asset = asset;
      }
    });
    this.mobileTerminals$ = this.store.select(MobileTerminalSelectors.getobileTerminalsForUrlAsset);
  }

  mapDispatchToProps() {
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.getSelectedAsset());
  }

  ngOnDestroy() {
    if(this.assetSubscription !== undefined) {
      this.assetSubscription.unsubscribe();
    }
  }

  getHeadline() {
    return typeof this.asset.name !== 'undefined' && this.asset.name !== null && this.asset.name.length > 0
      ? this.asset.name
      : 'Asset' + this.asset.id;
  }

}
