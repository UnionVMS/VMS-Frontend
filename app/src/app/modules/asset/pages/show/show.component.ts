import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { ContactActions, ContactInterfaces, ContactSelectors } from '@data/contact';
import { MobileTerminalInterfaces, MobileTerminalSelectors } from '@data/mobile-terminal';
import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';

@Component({
  selector: 'asset-show-page',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private store: Store<State>, private viewContainerRef: ViewContainerRef) { }

  public assetSubscription: Subscription;
  // public contacts$: Observable<ContactInterfaces.Contact[]>;
  public notes$: Observable<NotesInterfaces.Note[]>;
  // public mobileTerminals$: Observable<Array<MobileTerminalInterfaces.MobileTerminal>>;
  public asset = {} as AssetInterfaces.Asset;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.assetSubscription = this.store.select(AssetSelectors.getSelectedAsset).subscribe((asset) => {
      if(typeof asset !== 'undefined') {
        this.asset = asset;
      }
    });
    // this.mobileTerminals$ = this.store.select(MobileTerminalSelectors.getMobileTerminalsForUrlAsset);
    // this.contacts$ = this.store.select(ContactSelectors.getContactsOnAsset);
    this.notes$ = this.store.select(NotesSelectors.getNotes);
  }

  mapDispatchToProps() {
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(AssetActions.getSelectedAsset());
    // this.store.dispatch(ContactActions.getContactsForSelectedAsset());
    this.store.dispatch(NotesActions.getNotesForSelectedAsset());
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
