import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

import { State } from '@app/app-reducer';
import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterInterfaces, RouterSelectors } from '@data/router';
import {
  createMobileTerminalFormValidator, addChannelToFormValidator, removeChannelAtFromFromValidator,
  validateSerialNoExistsFactory, memberNumberAndDnidExistsFactory
} from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'mobile-terminal-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  constructor(private store: Store<State>, private viewContainerRef: ViewContainerRef) { }

  public formValidator: FormGroup;
  public mobileTerminalSubscription: Subscription;
  public pluginSubscription: Subscription;
  public selectedAsset: AssetInterfaces.Asset;

  public serialNumberExists: (serialNumber: string, isSelf?: boolean) => void;
  public memberNumberAndDnidCombinationExists: (memberNumber: string, dnid: string, channelId: string, isSelf?: boolean) => void;
  public serialNumberExists$: Observable<boolean>;
  public memberNumberAndDnidCombinationExists$: Observable<Readonly<{
    readonly [channelId: string]: boolean;
  }>>;
  public isSameSerielNumber = false;
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminal = {
    channels: []
  } as MobileTerminalInterfaces.MobileTerminal;
  public plugins: Array<MobileTerminalInterfaces.Plugin> = [];
  public oceanRegions = [
    'East Atlantic',
    'Indian',
    'Pacific',
    'West Atlantic'
  ];
  public save: () => void;
  public mergedRoute: RouterInterfaces.MergedRoute;

  private mobileTerminalIsFetched = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1);
  }

  mapStateToProps() {
    this.serialNumberExists$ = this.store.select(MobileTerminalSelectors.getSerialNumberExists);

    const validateSerialNoExistsFunction = validateSerialNoExistsFactory(this.serialNumberExists$);

    this.memberNumberAndDnidCombinationExists$ = this.store.select(MobileTerminalSelectors.getMemberNumberAndDnidCombinationExists);
    const memberNumberAndDnidExistsFunction = memberNumberAndDnidExistsFactory(this.memberNumberAndDnidCombinationExists$);

    this.mobileTerminalSubscription = this.store.select(MobileTerminalSelectors.getMobileTerminalsByUrl)
      .pipe(takeUntil(this.unmount$)).subscribe((mobileTerminal) => {
        if(typeof mobileTerminal !== 'undefined') {
          this.mobileTerminal = mobileTerminal;
          this.mobileTerminalIsFetched = true;
        }
        this.formValidator = createMobileTerminalFormValidator(
          this.mobileTerminal,
          validateSerialNoExistsFunction,
          memberNumberAndDnidExistsFunction
        );
    });
    this.pluginSubscription = this.store.select(MobileTerminalSelectors.getPlugins).pipe(takeUntil(this.unmount$)).subscribe((plugins) => {
      if(typeof plugins !== 'undefined') {
        // Only show INMARSAT_C at this time.
        this.plugins = plugins.filter((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');
        const basePlugin = this.plugins.find((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');

        if(typeof this.mobileTerminal.plugin === 'undefined' && typeof basePlugin !== 'undefined') {
          this.mobileTerminal.plugin = basePlugin;
          this.mobileTerminal.mobileTerminalType = this.mobileTerminal.plugin.pluginSatelliteType;
          this.formValidator = createMobileTerminalFormValidator(
            this.mobileTerminal,
            validateSerialNoExistsFunction,
            memberNumberAndDnidExistsFunction
          );
        }
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
    this.save = () => {
      const channelsById = this.mobileTerminal.channels.reduce((channels, channel) => {
        channels[channel.id] = channel;
        return channels;
      }, {});
      this.store.dispatch(MobileTerminalActions.saveMobileTerminal({ mobileTerminal: {
        ...this.mobileTerminal,
        mobileTerminalType: this.formValidator.value.essentailFields.mobileTerminalType,
        serialNo: this.formValidator.value.essentailFields.serialNo,
        eastAtlanticOceanRegion: this.formValidator.value.essentailFields.eastAtlanticOceanRegion,
        indianOceanRegion: this.formValidator.value.essentailFields.indianOceanRegion,
        pacificOceanRegion: this.formValidator.value.essentailFields.pacificOceanRegion,
        westAtlanticOceanRegion: this.formValidator.value.essentailFields.westAtlanticOceanRegion,
        transceiverType: this.formValidator.value.essentailFields.transceiverType,
        softwareVersion: this.formValidator.value.mobileTerminalFields.softwareVersion > ''
          ? this.formValidator.value.mobileTerminalFields.softwareVersion
          : null,
        antenna: this.formValidator.value.mobileTerminalFields.antenna > ''
          ? this.formValidator.value.mobileTerminalFields.antenna
          : null,
        satelliteNumber: this.formValidator.value.mobileTerminalFields.satelliteNumber > ''
          ? this.formValidator.value.mobileTerminalFields.satelliteNumber
          : null,
        active: this.formValidator.value.mobileTerminalFields.active === null ?
          false : this.formValidator.value.mobileTerminalFields.active,
        installDate: this.formValidator.value.mobileTerminalFields.installDate,
        uninstallDate: this.formValidator.value.mobileTerminalFields.uninstallDate,
        installedBy: this.formValidator.value.mobileTerminalFields.installedBy,
        channels: this.formValidator.value.channels.map((channel) => {
          if(channel.id.indexOf('temp-') === -1) {
            return {
              ...channelsById[channel.id],
              ...channel
            };
          } else {
            const newChannel = { ...channel };
            Object.keys(newChannel).forEach(key => {
              if(newChannel[key] === '') {
                newChannel[key] = null;
              }
            });
            delete newChannel.id;
            return newChannel;
          }
        }),
      }}));
    };
    this.serialNumberExists = (serialNumber: string, isSelf?: boolean) =>
      this.store.dispatch(MobileTerminalActions.getSerialNumberExists({ serialNumber, isSelf }));
    this.memberNumberAndDnidCombinationExists = (memberNumber: string, dnid: string, channelId: string, isSelf?: boolean) =>
      this.store.dispatch(MobileTerminalActions.getMemberNumberAndDnidCombinationExists({ memberNumber, dnid, channelId, isSelf }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(MobileTerminalActions.getSelectedMobileTerminal());
    this.store.dispatch(MobileTerminalActions.getPlugins());
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  trackChannelsBy(index: number, channel: any): string | number {
    return channel.id;
  }

  nrOfChannels() {
    return this.formValidator.value.channels.length;
  }

  createNewChannel() {
    addChannelToFormValidator(this.formValidator, this.memberNumberAndDnidCombinationExists);
  }

  removeChannel(index: number) {
    removeChannelAtFromFromValidator(this.formValidator, index);
  }

  isCreate() {
    return typeof this.mergedRoute.params.mobileTerminalId === 'undefined';
  }

  isFormReady() {
    return this.isCreate() || (this.mobileTerminalIsFetched && Object.entries(this.mobileTerminal).length !== 0);
  }

  getErrors(path: string[]): Array<{errorType: string, error: string }> {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors).map(errorType => ({ errorType, error: errors[errorType] }));
  }

  errorMessage(error: any) {
    if(error.errorType === 'serialNumberAlreadyExists') {
      return $localize`:@@ts-mobileTerminal-form-error-serialnumber:Serial number already exists, choose another one!`;
    }
    if(error.errorType === 'memberNumberAndDnidCombinationExists') {
      // tslint:disable-next-line max-line-length
      return $localize`:@@ts-mobileTerminal-form-error-membernumber-and-dnid:MemberNr and DNID Combination already exists, change one of the fields!`;
    }
    if(error.errorType === 'validateAlphanumericHyphenAndSpace') {
      return $localize`:@@ts-mobileTerminal-form-error:Invalid characters given, only letters, digits, space and hypen is allowed.`;
    }
    return errorMessage(error.errorType, error.error);
  }

  getErrorMessages(path: string[]): string[] {
    return this.getErrors(path).map(error => this.errorMessage(error));
  }

  serialNumberExistsForForm() {
    const newSerialNumber = this.formValidator.value.essentailFields.serialNo;
    if(this.mobileTerminal.serialNo === newSerialNumber) {
      return this.serialNumberExists(newSerialNumber, true);
    }
    this.serialNumberExists(newSerialNumber);
  }

  checkIfMemberNumberAndDnidExists(channel: MobileTerminalInterfaces.Channel, alsoTriggerPath: string[]) {
    const alsoTrigger = this.formValidator.get(alsoTriggerPath);
    alsoTrigger.updateValueAndValidity({ onlySelf: true });
    const mtChannel = this.mobileTerminal.channels.find(mbtChannel => mbtChannel.id === channel.id);

    if(channel.memberNumber === mtChannel.memberNumber && channel.dnid === mtChannel.dnid) {
      return this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id, true);
    }
    this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id);
  }

  updateValue(path: string[], value: any) {
    const formControl = this.formValidator.get(path);
    formControl.setValue(value);
  }
}
