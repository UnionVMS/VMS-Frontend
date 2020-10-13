import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'mobile-terminal-history-page',
  templateUrl: './history.component.html',
})
export class HistoryPageComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public userTimezone$: Observable<string>;
  public assets: Readonly<{ readonly [assetId: string]: AssetTypes.Asset }>;
  public mobileTerminal: MobileTerminalTypes.MobileTerminal;
  public mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList;
  public mobileTerminalHistoryFilter$: Observable<MobileTerminalTypes.MobileTerminalHistoryFilter>;
  public mergedRoute: RouterTypes.MergedRoute;

  public addMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;
  public removeMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;


  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalByUrl).pipe(
      takeUntil(this.unmount$),
      skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined'),
      take(1)
    ).subscribe((mobileTerminal) => {
      this.mobileTerminal = mobileTerminal;
    });

    this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryFilteredForUrlMobileTerminal).pipe(
      takeUntil(this.unmount$)
    ).subscribe((mobileTerminalHistory) => {
      this.mobileTerminalHistoryList = mobileTerminalHistory;
      const assetIds = Object.values(this.mobileTerminalHistoryList).reduce((acc, mtHistory) => {
          if(typeof mtHistory.snapshot.assetId !== 'undefined' && !acc.includes(mtHistory.snapshot.assetId)) {
            acc.push(mtHistory.snapshot.assetId);
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
    });

    this.store.select(AssetSelectors.getCurrentAssetList).pipe(
      takeUntil(this.unmount$),
      filter(searchResults => searchResults.length !== 0 && typeof this.mobileTerminalHistoryList !== 'undefined')
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
    this.mobileTerminalHistoryFilter$ = this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryFilter);
  }

  mapDispatchToProps() {
    this.addMobileTerminalHistoryFilters = (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) =>
      this.store.dispatch(MobileTerminalActions.addMobileTerminalHistoryFilters({ historyFilter }));
    this.removeMobileTerminalHistoryFilters = (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) =>
      this.store.dispatch(MobileTerminalActions.removeMobileTerminalHistoryFilters({ historyFilter }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }
}
