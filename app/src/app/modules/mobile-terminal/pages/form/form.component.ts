import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { take, takeUntil, map, skipWhile } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { State } from '@app/app-reducer';
import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { MobileTerminalTypes, MobileTerminalActions, MobileTerminalSelectors } from '@data/mobile-terminal';
import { RouterTypes, RouterSelectors } from '@data/router';
import {
  createMobileTerminalFormValidator, addChannelToFormValidator, removeChannelAtFromFromValidator,
  validateSerialNoExistsFactory, memberNumberAndDnidExistsFactory
} from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

import { Moment } from 'moment-timezone';

@Component({
  selector: 'mobile-terminal-edit-page',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('toolbox') toolbox;
  @ViewChild('channels') channels: ElementRef;
  constructor(
    private readonly store: Store<State>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly router: Router,
  ) { }

  public createWithSerialNo: string | null;
  public formValidator: FormGroup;
  public mobileTerminalSubscription: Subscription;
  public pluginSubscription: Subscription;
  public selectedAsset: AssetTypes.Asset;

  public serialNumberExists: (serialNumber: string, isSelf?: boolean) => void;
  public memberNumberAndDnidCombinationExists: (memberNumber: number, dnid: number, channelId: string, isSelf?: boolean) => void;
  public serialNumberExists$: Observable<boolean>;
  public memberNumberAndDnidCombinationExists$: Observable<Readonly<{
    readonly [channelId: string]: boolean;
  }>>;
  public isSameSerielNumber = false;
  public channelsAlreadyInUseBy = {
    poll: null,
    config: null,
    default: null,
  };
  public unmount$: Subject<boolean> = new Subject<boolean>();
  public mobileTerminal: MobileTerminalTypes.MobileTerminal = {
    channels: [] as ReadonlyArray<MobileTerminalTypes.Channel>
  } as MobileTerminalTypes.MobileTerminal;
  public plugins: Array<MobileTerminalTypes.Plugin> = [];
  public initialPlugin: MobileTerminalTypes.Plugin;
  public oceanRegions = [
    'East Atlantic',
    'Indian',
    'Pacific',
    'West Atlantic'
  ];
  public save: () => void;
  public mergedRoute: RouterTypes.MergedRoute;

  public currentChannelOpened = 0;

  private mobileTerminalIsFetched = false;
  private mobileTerminalPluginsFetched = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewContainerRef.createEmbeddedView(this.toolbox);
    }, 1000);
  }

  mapStateToProps() {
    this.store.select(MobileTerminalSelectors.getCreateWithSerialNo)
      .pipe(takeUntil(this.unmount$))
      .subscribe((createWithSerialNo) => {
        this.createWithSerialNo = createWithSerialNo;
      });

    this.serialNumberExists$ = this.store.select(MobileTerminalSelectors.getSerialNumberExists);

    const validateSerialNoExistsFunction = validateSerialNoExistsFactory(this.serialNumberExists$);

    this.memberNumberAndDnidCombinationExists$ = this.store.select(MobileTerminalSelectors.getMemberNumberAndDnidCombinationExists);
    const memberNumberAndDnidExistsFunction = memberNumberAndDnidExistsFactory(this.memberNumberAndDnidCombinationExists$);

    this.mobileTerminalSubscription = this.store.select(MobileTerminalSelectors.getMobileTerminalsByUrl)
      .pipe(
        takeUntil(this.unmount$),
        skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined'),
        take(1)
      ).subscribe((mobileTerminal) => {
        this.mobileTerminal = mobileTerminal;
        if(typeof this.mobileTerminal.plugin === 'undefined' && typeof this.initialPlugin !== 'undefined') {
          this.mobileTerminal = {
            ...this.mobileTerminal,
            plugin: this.initialPlugin,
            mobileTerminalType: this.initialPlugin.pluginSatelliteType
          };
        }
        this.mobileTerminalIsFetched = true;
        this.mobileTerminal.channels.map(channel => {
          if(channel.pollChannel === true) {
            this.channelsAlreadyInUseBy.poll = channel.id;
          }
          if(channel.configChannel === true) {
            this.channelsAlreadyInUseBy.config = channel.id;
          }
          if(channel.defaultChannel === true) {
            this.channelsAlreadyInUseBy.default = channel.id;
          }
        });

        this.formValidator = createMobileTerminalFormValidator(
          this.mobileTerminal,
          validateSerialNoExistsFunction,
          memberNumberAndDnidExistsFunction
        );

        const channels = this.formValidator.get(['channels']).value;
        for(let i = 0; i < channels.length; i++) {
          if(this.channelsAlreadyInUseBy.poll !== null && this.channelsAlreadyInUseBy.poll !== channels[i].id) {
            this.formValidator.get(['channels', i, 'pollChannel']).disable();
          }
          if(this.channelsAlreadyInUseBy.config !== null && this.channelsAlreadyInUseBy.config !== channels[i].id) {
            this.formValidator.get(['channels', i, 'configChannel']).disable();
          }
          if(this.channelsAlreadyInUseBy.default !== null && this.channelsAlreadyInUseBy.default !== channels[i].id) {
            this.formValidator.get(['channels', i, 'defaultChannel']).disable();
          }
        }
    });
    this.pluginSubscription = this.store.select(MobileTerminalSelectors.getPlugins).pipe(takeUntil(this.unmount$)).subscribe((plugins) => {
      if(typeof plugins !== 'undefined') {
        // Only show INMARSAT_C at this time.
        this.plugins = plugins.filter((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');
        const basePlugin = this.plugins.find((plugin) => plugin.pluginSatelliteType === 'INMARSAT_C');

        if(typeof this.mobileTerminal !== 'undefined') {
          if(typeof this.mobileTerminal.plugin === 'undefined' && typeof basePlugin !== 'undefined') {
            this.mobileTerminal = {
              ...this.mobileTerminal,
              plugin: basePlugin,
              mobileTerminalType: basePlugin.pluginSatelliteType
            };

            this.formValidator = createMobileTerminalFormValidator(
              this.mobileTerminal,
              validateSerialNoExistsFunction,
              memberNumberAndDnidExistsFunction
            );
          }
        } else {
          this.initialPlugin = basePlugin;
        }
        this.mobileTerminalPluginsFetched = true;
      }
    });
    this.store.select(RouterSelectors.getMergedRoute).pipe(take(1)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      if(typeof this.mergedRoute.params.assetId !== 'undefined') {
        this.store.dispatch(AssetActions.getSelectedAsset());
      }

      if(this.isCreate()) {
        if(typeof this.createWithSerialNo === 'undefined' || this.createWithSerialNo === null) {
          this.router.navigate(['/asset/' + this.mergedRoute.params.assetId + '/mobileTerminal/attach']);
        }
        this.mobileTerminal = { ...this.mobileTerminal, serialNo: this.createWithSerialNo };
        this.formValidator = createMobileTerminalFormValidator(
          this.mobileTerminal,
          validateSerialNoExistsFunction,
          memberNumberAndDnidExistsFunction
        );
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
        eastAtlanticOceanRegion: this.formValidator.value.essentailFields.selectedOceanRegions.includes('East Atlantic'),
        indianOceanRegion: this.formValidator.value.essentailFields.selectedOceanRegions.includes('Indian'),
        pacificOceanRegion: this.formValidator.value.essentailFields.selectedOceanRegions.includes('Pacific'),
        westAtlanticOceanRegion: this.formValidator.value.essentailFields.selectedOceanRegions.includes('West Atlantic'),
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
        installDate: this.formValidator.value.mobileTerminalFields.installDate === null
          ? null
          : this.formValidator.value.mobileTerminalFields.installDate.format('x'),
        uninstallDate: this.formValidator.value.mobileTerminalFields.uninstallDate === null
          ? null
          : this.formValidator.value.mobileTerminalFields.uninstallDate.format('x'),
        installedBy: this.formValidator.value.mobileTerminalFields.installedBy,
        assetId: typeof this.mobileTerminal.assetId !== 'undefined' ? this.mobileTerminal.assetId : this.selectedAsset.id,
        channels: this.formValidator.value.channels.map((channel) => {
          const fixedChannel = {
            ...channel,
            startDate: channel.startDate === null ? null : (channel.startDate as unknown as Moment).format('x'),
            endDate: channel.endDate === null ? null : (channel.endDate as unknown as Moment).format('x'),
            pollChannel: typeof channel.pollChannel === 'undefined' ? false : channel.pollChannel,
            configChannel: typeof channel.configChannel === 'undefined' ? false : channel.configChannel,
            defaultChannel: typeof channel.defaultChannel === 'undefined' ? false : channel.defaultChannel,
            expectedFrequency: channel.expectedFrequency * 60 * 1000,
            frequencyGracePeriod: channel.frequencyGracePeriod * 60 * 1000,
            expectedFrequencyInPort: channel.expectedFrequencyInPort * 60 * 1000,
          };

          console.warn(fixedChannel);

          if(channel.id.indexOf('temp-') === -1) {
            return {
              ...channelsById[channel.id],
              ...fixedChannel
            };
          } else {
            const newChannel = { ...fixedChannel };
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
    this.memberNumberAndDnidCombinationExists = (memberNumber: number, dnid: number, channelId: string, isSelf?: boolean) => {
      if(typeof memberNumber !== 'number' || typeof dnid !== 'number') {
        return false;
      }
      return this.store.dispatch(MobileTerminalActions.getMemberNumberAndDnidCombinationExists({ memberNumber, dnid, channelId, isSelf }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.store.dispatch(MobileTerminalActions.resetFormFieldValid());
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

  createNewChannel() {
    addChannelToFormValidator(this.formValidator, memberNumberAndDnidExistsFactory(this.memberNumberAndDnidCombinationExists$));

    const lastAddedChannelIndex = this.formValidator.get(['channels']).value.length - 1;
    if(this.channelsAlreadyInUseBy.poll !== null) {
      this.formValidator.get(['channels', lastAddedChannelIndex, 'pollChannel']).disable();
    }
    if(this.channelsAlreadyInUseBy.config !== null) {
      this.formValidator.get(['channels', lastAddedChannelIndex, 'configChannel']).disable();
    }
    if(this.channelsAlreadyInUseBy.default !== null) {
      this.formValidator.get(['channels', lastAddedChannelIndex, 'defaultChannel']).disable();
    }

    this.setCurrentChannelOpened(lastAddedChannelIndex);

    const observer = new MutationObserver((mutations, mutationObserver) => {
      const newChannel = this.channels.nativeElement.children.item(lastAddedChannelIndex);
      if (newChannel !== null) {
        newChannel.scrollIntoView({ behavior: 'smooth'});
        newChannel.getElementsByClassName('mobile-terminal-form--channel-name').item(0)
          .getElementsByTagName('input').item(0)
          .focus();
        mutationObserver.disconnect(); // stop observing
        return;
      }
    });

    observer.observe(this.channels.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  setCurrentChannelOpened(index: number) {
    this.currentChannelOpened = index;
  }

  removeChannel(index: number) {
    removeChannelAtFromFromValidator(this.formValidator, index);
  }

  isCreate() {
    return typeof this.mergedRoute.params.mobileTerminalId === 'undefined';
  }

  isFormReady() {
    return this.isCreate()
      || (
        this.mobileTerminalIsFetched
        && this.mobileTerminalPluginsFetched
        && Object.entries(this.mobileTerminal).length !== 0
      );
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
      this.serialNumberExists(newSerialNumber, true);
    } else {
      this.serialNumberExists(newSerialNumber);
    }
    this.formValidator.get(['essentailFields', 'serialNo']).updateValueAndValidity({ onlySelf: true });
  }

  checkIfMemberNumberAndDnidExists(channel: MobileTerminalTypes.Channel, channelNr: number) {
    const mtChannel = this.mobileTerminal.channels.find(mbtChannel => mbtChannel.id === channel.id);
    if(typeof mtChannel !== 'undefined' && channel.memberNumber === mtChannel.memberNumber && channel.dnid === mtChannel.dnid) {
      this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id, true);
    } else {
      this.memberNumberAndDnidCombinationExists(channel.memberNumber, channel.dnid, channel.id);
    }

    ['memberNumber', 'dnid'].map(
      (field) => this.formValidator.get(['channels', channelNr, field]).updateValueAndValidity({ onlySelf: true })
    );
  }

  updateValue(path: string[], value: any) {
    const formControl = this.formValidator.get(path);
    formControl.setValue(value);
  }

  updateChannelInUse(event, channelNr: number, field: string) {
    const channels = this.formValidator.get(['channels']).value;
    if(field === 'pollChannel') {
      this.channelsAlreadyInUseBy.poll = channels[channelNr].id;
    } else if(field === 'configChannel') {
      this.channelsAlreadyInUseBy.config = channels[channelNr].id;
    } else if(field === 'defaultChannel') {
      this.channelsAlreadyInUseBy.default = channels[channelNr].id;
    }

    channels.map((channel, i) => {
      if(i !== channelNr) {
        if(event.checked) {
          this.formValidator.get(['channels', i, field]).disable();
        } else {
          this.formValidator.get(['channels', i, field]).enable();
        }
      }
    });
  }
}
