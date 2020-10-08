import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, first, skipWhile } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'mobile-terminal-show-page',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
})
export class ShowPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public userTimezone$: Observable<string>;
  public asset: AssetTypes.Asset;
  public mergedRoute: RouterTypes.MergedRoute;
  public mobileTerminal: MobileTerminalTypes.MobileTerminal;

  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalByUrl).pipe(
      takeUntil(this.unmount$),
      skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined'),
      take(1)
    ).subscribe((mobileTerminal) => {
      this.mobileTerminal = mobileTerminal;
      if(typeof mobileTerminal.assetId !== 'undefined' && mobileTerminal.assetId !== null) {
        this.store.dispatch(AssetActions.selectAsset({ assetId: mobileTerminal.assetId }));
      }
    });

    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe(asset => {
      this.asset = asset;
    });

    this.store.select(RouterSelectors.getMergedRoute).pipe(takeUntil(this.unmount$), take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.mobileTerminalId !== 'undefined') {
        this.store.dispatch(MobileTerminalActions.getSelectedMobileTerminal());
      }
    });
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
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
}
