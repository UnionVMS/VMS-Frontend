import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take} from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

import { State } from '@app/app-reducer';
import { AssetActions } from '@data/asset';
import { MobileTerminalInterfaces, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterInterfaces, RouterSelectors } from '@data/router';
import { createMobileTerminalFormValidator, addChannelToFormValidator, removeChannelAtFromFromValidator, validateSerialNoExistsFactory, memberNumberAndDnidExistsFactory } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'mobile-terminal-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  public formValidator: FormGroup;
  public mobileTerminalSubscription: Subscription;
  public pluginSubscription: Subscription;
  public serialNumberExists: (serialNumber: string, isSelf?: boolean) => void;
  public memberNumberAndDnidCombinationExists: (memberNumber: string, dnid: string, channelId: string, isSelf?: boolean) => void;
  public serialNumberExists$: Observable<boolean>;
  public memberNumberAndDnidCombinationExists$: Observable<Readonly<{
    readonly [channelId: string]: boolean;
  }>>;
  public isSameSerielNumber = false;

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

  private unmount$: Subject<boolean> = new Subject<boolean>();

  mapStateToProps() {
    validateSerialNoExistsFactory
    memberNumberAndDnidExistsFactory
    this.serialNumberExists$ = this.store.select(MobileTerminalSelectors.getSerialNumberExists);

    const validateSerialNoExistsFunction = validateSerialNoExistsFactory(this.serialNumberExists$);

    this.memberNumberAndDnidCombinationExists$ = this.store.select(MobileTerminalSelectors.getMemberNumberAndDnidCombinationExists);
    const memberNumberAndDnidExistsFunction = memberNumberAndDnidExistsFactory(this.memberNumberAndDnidCombinationExists$);

    this.mobileTerminalSubscription = this.store.select(MobileTerminalSelectors.getMobileTerminalsByUrl).subscribe(
      (mobileTerminal) => {
        if(typeof mobileTerminal !== 'undefined') {
          this.mobileTerminal = mobileTerminal;
        }
        this.formValidator = createMobileTerminalFormValidator(this.mobileTerminal, validateSerialNoExistsFunction, memberNumberAndDnidExistsFunction);
      }
    );
    this.pluginSubscription = this.store.select(MobileTerminalSelectors.getPlugins).subscribe((plugins) => {
      if(typeof plugins !== 'undefined') {
        // Only show INMARSAT_C at this time.
        this.plugins = plugins.filter((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');
        const basePlugin = this.plugins.find((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');

        if(typeof this.mobileTerminal.plugin === 'undefined' && typeof basePlugin !== 'undefined') {
          this.mobileTerminal.plugin = basePlugin;
          this.mobileTerminal.mobileTerminalType = this.mobileTerminal.plugin.pluginSatelliteType;
          this.formValidator = createMobileTerminalFormValidator(this.mobileTerminal, validateSerialNoExistsFunction, memberNumberAndDnidExistsFunction);
        }
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
          if(channel.id !== null && channel.id.length > 0) {
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
      this.store.dispatch(MobileTerminalActions.serialNumberExists({ serialNumber, isSelf }))
    this.memberNumberAndDnidCombinationExists = (memberNumber: string, dnid: string, channelId: string, isSelf?: boolean) =>
      this.store.dispatch(MobileTerminalActions.memberNumberAndDnidCombinationExists({ memberNumber, dnid, channelId, isSelf }))
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
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  trackChannelsBy(index: number, channel: MobileTerminalInterfaces.Channel): string | number {
    return channel.id > '' ? channel.id : index;
  }

  createNewChannel() {
    addChannelToFormValidator(this.formValidator);
  }

  removeChannel(index: number) {
    removeChannelAtFromFromValidator(this.formValidator, index);
  }

  isCreate() {
    return typeof this.mergedRoute.params.mobileTerminalId === 'undefined';
  }

  isFormReady() {
    return this.isCreate() || Object.entries(this.mobileTerminal).length !== 0;
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors).map(errorType => ({ errorType, error: errors[errorType] }));
  }

  errorMessage(error: any) {
    if(error.errorType === 'serialNumberAlreadyExists') {
      return 'Serial number already exists, choose another one!';
    }
    if(error.errorType === 'memberNumberAndDnidCombinationExists') {
      return 'memberNr and DNID Combination already exists, change one of the fields!';
    }
    if(error.errorType === 'validateAlphanumericHyphenAndSpace') {
      return $localize`:@@ts-mobileTerminal-form-error:Invalid characters given, only letters, digits, space and hypen is allowed.`;
    }
    return errorMessage(error.errorType, error.error);
  }

  serialNumberExistsForForm() {
    const newSerialNumber = this.formValidator.value.essentailFields.serialNo;
    if(this.mobileTerminal.serialNo === newSerialNumber) {
      return this.serialNumberExists(newSerialNumber, true);
    }
    this.serialNumberExists(newSerialNumber);
  }

  checkIfMemberNumberAndDnidExists(channel, alsoTriggerPath: string[]) {
    const alsoTrigger = this.formValidator.get(alsoTriggerPath);
    alsoTrigger.updateValueAndValidity({ onlySelf: true });
    const mtChannel = this.mobileTerminal.channels.find(mtChannel => mtChannel.id === channel.id);

    if(channel.memberNumber === mtChannel.memberNumber && channel.dnid === mtChannel.dnid){
      return this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id, true);
    }
    this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id);
  }

}
