import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, first, skipWhile, filter } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'mobile-terminal-attachment-history-page',
  templateUrl: './attachment-history.component.html',
})
export class AttachmentHistoryPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public userTimezone$: Observable<string>;
  public assets: Readonly<{ readonly [assetId: string]: AssetTypes.Asset }>;
  public mobileTerminal: MobileTerminalTypes.MobileTerminal;
  public mobileTerminalHistory: Readonly<{ readonly [mobileTerminalId: string]: MobileTerminalTypes.MobileTerminalHistoryList }>;
  public mergedRoute: RouterTypes.MergedRoute;

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalByUrl).pipe(
      takeUntil(this.unmount$),
      skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined'),
      take(1)
    ).subscribe((mobileTerminal) => {
      this.mobileTerminal = mobileTerminal;
      this.getAssetsForHistory();
    });

    this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryByMobileTerminalIds).pipe(
      takeUntil(this.unmount$)
    ).subscribe((mobileTerminalHistory) => {
      this.mobileTerminalHistory = mobileTerminalHistory;
      this.getAssetsForHistory();
    });

    this.store.select(AssetSelectors.getCurrentAssetList).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults.length !== 0 && typeof this.mobileTerminalHistory !== 'undefined')
    ).subscribe((searchResults) => {
      this.assets = searchResults.reduce((acc, asset) => ({ ...acc, [asset.id]: asset }), {});
    });

    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.mobileTerminalId !== 'undefined') {
        this.store.dispatch(MobileTerminalActions.getSelectedMobileTerminal());
        this.store.dispatch(MobileTerminalActions.getMobileTerminalHistory({
          mobileTerminalId: this.mergedRoute.params.mobileTerminalId
        }));
      }
    });
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  getAssetsForHistory() {
    if(
      this.mobileTerminal !== undefined
      && this.mobileTerminalHistory !== undefined
      && this.mobileTerminalHistory[this.mobileTerminal.id] !== undefined
    ) {
      const assetIds = Object.values(this.mobileTerminalHistory[this.mobileTerminal.id]).reduce((acc, mobileTerminalHistory) => {
          if(typeof mobileTerminalHistory.snapshot.assetId !== 'undefined' && !acc.includes(mobileTerminalHistory.snapshot.assetId)) {
            acc.push(mobileTerminalHistory.snapshot.assetId);
          }
          return acc;
        }, []
      );
      this.store.dispatch(AssetActions.searchAssets({ searchQuery: {
        fields: assetIds.map(assetId => ({
          searchField: 'GUID',
          searchValue: assetId
        })),
        logicalAnd: false
      }, userSearch: false }));
    }
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
