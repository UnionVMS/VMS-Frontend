import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { State } from '@app/app-reducer';
import { AssetActions, AssetInterfaces } from '@data/asset';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterInterfaces, RouterSelectors } from '@data/router';

@Component({
  selector: 'mobile-terminal-show-by-asset-page',
  templateUrl: './show-by-asset.component.html',
  styleUrls: ['./show-by-asset.component.scss'],
})
export class ShowByAssetPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private store: Store<State>, private viewContainerRef: ViewContainerRef) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminals: ReadonlyArray<MobileTerminalInterfaces.MobileTerminal>;
  public currentMobileTerminal: MobileTerminalInterfaces.MobileTerminal;
  public mergedRoute: RouterInterfaces.MergedRoute;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalsForUrlAsset).pipe(takeUntil(this.unmount$)).subscribe((mobileTerminals) => {
      this.mobileTerminals = mobileTerminals;
      if(this.mobileTerminals.length > 0) {
        this.currentMobileTerminal = this.mobileTerminals[0];
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
  }

  mapDispatchToProps() {}

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }
  changeCurrentMobileTerminal(event: MatTabChangeEvent) {
    this.currentMobileTerminal = this.mobileTerminals[event.index];
  }
}
