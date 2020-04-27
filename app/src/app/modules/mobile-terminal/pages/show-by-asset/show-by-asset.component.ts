import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'mobile-terminal-show-by-asset-page',
  templateUrl: './show-by-asset.component.html',
  styleUrls: ['./show-by-asset.component.scss'],
})
export class ShowByAssetPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(
    private readonly store: Store<State>,
    private readonly viewContainerRef: ViewContainerRef, public dialog: MatDialog
  ) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminals: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  public currentMobileTerminal: MobileTerminalTypes.MobileTerminal;
  public mergedRoute: RouterTypes.MergedRoute;
  public selectedAsset: AssetTypes.Asset;

  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  public activeMobileTerminal: MobileTerminalTypes.MobileTerminal;


  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getMobileTerminalsForUrlAsset).pipe(takeUntil(this.unmount$)).subscribe((mobileTerminals) => {
      this.mobileTerminals = mobileTerminals.map((mobileTerminal: MobileTerminalTypes.MobileTerminal) => ({
        ...mobileTerminal,
        installDateFormatted: formatUnixtime(mobileTerminal.installDate),
        uninstallDateFormatted: formatUnixtime(mobileTerminal.uninstallDate),
        channels: mobileTerminal.channels.slice().sort((c1: MobileTerminalTypes.Channel, c2: MobileTerminalTypes.Channel) => {
          return c1.name.localeCompare(c2.name);
        }).map(channel => ({
          ...channel,
          startDateFormatted: formatUnixtime(channel.startDate),
          endDateFormatted: formatUnixtime(channel.endDate)
        }))
      }));
      if(this.mobileTerminals.length > 0) {
        if(
          typeof this.currentMobileTerminal === 'undefined' ||
          !this.mobileTerminals.some(mobileTerminal => mobileTerminal.id === this.currentMobileTerminal.id)
        ) {
          this.currentMobileTerminal = this.mobileTerminals[0];
        }
        this.activeMobileTerminal = this.mobileTerminals.find(mobileTerminal => mobileTerminal.active);
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }
    });
    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe((asset) => {
      this.selectedAsset = asset;
    });
  }

  mapDispatchToProps() {
    this.saveMobileTerminal = (mobileTerminal: MobileTerminalTypes.MobileTerminal) =>
      this.store.dispatch(MobileTerminalActions.saveMobileTerminal({ mobileTerminal }));
  }

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

  openDetachDialog(templateRef: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(templateRef);

    dialogRef.afterClosed().subscribe(resultDetach => {
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

    dialogRef.afterClosed().subscribe(resultDetach => {
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
