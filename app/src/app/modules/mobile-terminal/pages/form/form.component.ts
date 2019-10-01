import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { formatDate } from '@app/helpers/helpers';



import { State } from '@app/app-reducer';
import { AssetActions } from '@data/asset';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { NotificationsInterfaces, NotificationsActions } from '@data/notifications';
import { RouterInterfaces, RouterSelectors } from '@data/router';

@Component({
  selector: 'asset-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public mobileTerminalSubscription: Subscription;
  public pluginSubscription: Subscription;
  public mobileTerminal = {} as MobileTerminalInterfaces.MobileTerminal;
  public plugins: Array<MobileTerminalInterfaces.Plugin> = [];
  public selectedOceanRegions = [];
  public oceanRegions = [
    'East Atlantic',
    'Indian',
    'Pacific',
    'West Atlantic'
  ];
  public save: () => void;
  public mergedRoute: RouterInterfaces.MergedRoute;

  mapStateToProps() {
    this.mobileTerminalSubscription = this.store.select(MobileTerminalSelectors.getMobileTerminalsByUrl).subscribe(
      (mobileTerminal) => {
        if(typeof mobileTerminal !== 'undefined') {
          this.mobileTerminal = mobileTerminal;
          if(this.mobileTerminal.eastAtlanticOceanRegion) { this.selectedOceanRegions.push('East Atlantic'); }
          if(this.mobileTerminal.indianOceanRegion) { this.selectedOceanRegions.push('Indian'); }
          if(this.mobileTerminal.pacificOceanRegion) { this.selectedOceanRegions.push('Pacific'); }
          if(this.mobileTerminal.westAtlanticOceanRegion) { this.selectedOceanRegions.push('West Atlantic'); }
        }
      }
    );
    this.pluginSubscription = this.store.select(MobileTerminalSelectors.getPlugins).subscribe((plugins) => {
      if(typeof plugins !== 'undefined') {
        this.plugins = plugins;
      }
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
      const formValidation = this.validateForm();
      if(formValidation === true) {
        this.store.dispatch(MobileTerminalActions.saveMobileTerminal({ mobileTerminal: this.mobileTerminal }));
      } else {
        formValidation.map((notification) => {
          this.store.dispatch(NotificationsActions.addNotification(notification));
        });
      }
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(MobileTerminalActions.getSelectedMobileTerminal());
    this.store.dispatch(MobileTerminalActions.getPlugins());
  }

  ngOnDestroy() {
    if(this.mobileTerminalSubscription !== undefined) {
      this.mobileTerminalSubscription.unsubscribe();
    }
    if(this.pluginSubscription !== undefined) {
      this.pluginSubscription.unsubscribe();
    }
  }

  createNewChannel() {
    if(typeof this.mobileTerminal.channels === 'undefined') {
      this.mobileTerminal.channels = [];
    }
    this.mobileTerminal.channels.unshift({
      expectedFrequency: 0,
      frequencyGracePeriod: 0,
      expectedFrequencyInPort: 0,
    } as MobileTerminalInterfaces.Channel);
  }

  changePlugin(event: MatSelectChange) {
    this.mobileTerminal.plugin = this.plugins.find((plugin) => plugin.pluginSatelliteType === event.value);
  }

  changeOceanRegions(event: MatSelectChange) {
    this.mobileTerminal.eastAtlanticOceanRegion = event.value.includes('East Atlantic');
    this.mobileTerminal.indianOceanRegion = event.value.includes('Indian');
    this.mobileTerminal.pacificOceanRegion = event.value.includes('Pacific');
    this.mobileTerminal.westAtlanticOceanRegion =  event.value.includes('West Atlantic');
  }

  isCreateOrUpdate() {
    return typeof this.mergedRoute.params.mobileTerminalId === 'undefined' ? 'Create' : 'Edit';
  }

  isFormReady() {
    return this.isCreateOrUpdate() === 'Create' || Object.entries(this.mobileTerminal).length !== 0;
  }

  toggleInactive() {
    this.mobileTerminal.inactivated = !this.mobileTerminal.inactivated;
  }

  toggleChannelField(channel: number, field: string) {
    this.mobileTerminal.channels[channel][field] = !this.mobileTerminal.channels[channel][field];
  }

  validateForm() {
    const errors = [];
    if(
      typeof this.mobileTerminal.mobileTerminalType === 'undefined' ||
      this.mobileTerminal.mobileTerminalType === null ||
      this.mobileTerminal.mobileTerminalType.length === 0
    ) {
      errors.push({
        notificationType: 'errors',
        notification: 'Form validaiton error: Require field <b>Transceiver system</b> is not set.'
      });
    }
    if(
      typeof this.mobileTerminal.serialNo === 'undefined' ||
      this.mobileTerminal.serialNo === null ||
      this.mobileTerminal.serialNo.length === 0
    ) {
      errors.push({
        notificationType: 'errors',
        notification: 'Form validaiton error: Require field <b>Serial no.</b> is not set.'
      });
    }

    return errors.length > 0 ? errors : true;
  }
}
