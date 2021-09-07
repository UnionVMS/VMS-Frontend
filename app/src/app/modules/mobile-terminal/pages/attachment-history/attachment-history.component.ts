import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, first, skipWhile, filter } from 'rxjs/operators';

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
  public mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList;
  public mergedRoute: RouterTypes.MergedRoute;

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalByUrl).pipe(
      takeUntil(this.unmount$),
      skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined'),
      take(1)
    ).subscribe((mobileTerminal) => {
      this.mobileTerminal = mobileTerminal;
    });
    
    this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryForUrlMobileTerminal).pipe(
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
