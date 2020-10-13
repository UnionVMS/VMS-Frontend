import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, first } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';
import { UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'mobile-terminal-show-by-asset-page',
  templateUrl: './show-by-asset.component.html',
  styleUrls: ['./show-by-asset.component.scss'],
})
export class ShowByAssetPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(
    private readonly store: Store<State>,
    private readonly viewContainerRef: ViewContainerRef,
    public dialog: MatDialog
  ) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public userTimezone$: Observable<string>;
  public currentTab = 0;
  public mobileTerminals: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  public mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList;
  public mobileTerminalHistoryFilter$: Observable<MobileTerminalTypes.MobileTerminalHistoryFilter>;
  public currentMobileTerminal: MobileTerminalTypes.MobileTerminal;
  public mergedRoute: RouterTypes.MergedRoute;
  public selectedAsset: AssetTypes.Asset;
  public mobileTerminalHistoryNotUpToDate = false;

  public addMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;
  public removeMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;
  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  public activeMobileTerminal: MobileTerminalTypes.MobileTerminal;
  public changeCurrentMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalsForUrlAsset).pipe(takeUntil(this.unmount$)).subscribe((mobileTerminals) => {
      this.mobileTerminals = mobileTerminals;
      if(this.mobileTerminals.length > 0) {
        if(
          typeof this.currentMobileTerminal === 'undefined' ||
          !this.mobileTerminals.some(mobileTerminal => mobileTerminal.id === this.currentMobileTerminal.id)
        ) {
          this.currentMobileTerminal = this.mobileTerminals[0];
        }
        this.activeMobileTerminal = this.mobileTerminals.find(mobileTerminal => mobileTerminal.active);

        if(this.mobileTerminalHistoryNotUpToDate) {
          this.mobileTerminalHistoryNotUpToDate = false;
          this.store.dispatch(MobileTerminalActions.getMobileTerminalHistoryForAsset({ assetId: this.selectedAsset.id }));
        }
      }
    });
    this.mobileTerminalHistoryFilter$ = this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryFilter);
    this.store.select(MobileTerminalSelectors.getMobileTerminalHistoryFilteredForUrlAsset)
      .pipe(takeUntil(this.unmount$)).subscribe((mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList) => {
        this.mobileTerminalHistoryList = mobileTerminalHistoryList;
      });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
    this.store.select(AssetSelectors.getAssetByUrl).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      this.selectedAsset = asset;
      if(typeof this.selectedAsset !== 'undefined') {
        this.store.dispatch(MobileTerminalActions.getMobileTerminalHistoryForAsset({ assetId: this.selectedAsset.id }));
      }
    });
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  mapDispatchToProps() {
    this.saveMobileTerminal = (mobileTerminal: MobileTerminalTypes.MobileTerminal) => {
      this.mobileTerminalHistoryNotUpToDate = true;
      this.store.dispatch(MobileTerminalActions.saveMobileTerminal({ mobileTerminal }));
    };
    this.addMobileTerminalHistoryFilters = (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) =>
      this.store.dispatch(MobileTerminalActions.addMobileTerminalHistoryFilters({ historyFilter }));
    this.removeMobileTerminalHistoryFilters = (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) =>
      this.store.dispatch(MobileTerminalActions.removeMobileTerminalHistoryFilters({ historyFilter }));
  }

  mapFunctionsToProps() {
    this.changeCurrentMobileTerminal = (mobileTerminal: MobileTerminalTypes.MobileTerminal) => {
      this.currentMobileTerminal = mobileTerminal;
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.mapFunctionsToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  changeCurrentTab(event: MatTabChangeEvent) {
    this.currentTab = event.index;
  }

  openDetachDialog(templateRef: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(templateRef);

    dialogRef.afterClosed().pipe(first()).subscribe(resultDetach => {
      if(resultDetach === true) {
        this.saveMobileTerminal({
          ...this.currentMobileTerminal,
          assetId: null
        });
      }
    });
  }

  openArchiveDialog(templateRef: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(templateRef);

    dialogRef.afterClosed().pipe(first()).subscribe(resultDetach => {
      if(resultDetach === true) {
        this.saveMobileTerminal({
          ...this.currentMobileTerminal,
          assetId: null,
          archived: true
        });
      }
    });
  }

  toggleActive($event: MatSlideToggleChange) {
    this.currentMobileTerminal = {
      ...this.currentMobileTerminal,
      active: $event.checked
    };
    this.saveMobileTerminal(this.currentMobileTerminal);
  }

  activeToggleDisabled() {
    const disabled = typeof this.activeMobileTerminal !== 'undefined' &&
      this.activeMobileTerminal !== null &&
      typeof this.currentMobileTerminal !== 'undefined' &&
      this.currentMobileTerminal.id !== this.activeMobileTerminal.id;
    return disabled;
  }
}
