import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MobileTerminalInterfaces } from '@data/mobile-terminal';
import { map, take, skip, skipWhile } from 'rxjs/operators';
import CustomValidators from '@validators/.';
import { Observable } from 'rxjs';
// @ts-ignore
import moment from 'moment-timezone';

interface MobileTerminalFormValidator {
  essentailFields: FormGroup;
  mobileTerminalFields: FormGroup;
  channels: FormArray;
}

const alphanumericWithHyphenAndSpace = (c: FormControl) => {
  const EMAIL_REGEXP = /^[a-z0-9\- ]*$/i;
  return c.value === null || c.value.length === 0 || EMAIL_REGEXP.test(c.value) ? null : {
    validateAlphanumericHyphenAndSpace: true
  };
};

export const validateSerialNoExistsFactory = (serialNoObservable: Observable<boolean>) => {
  return (control: AbstractControl) => serialNoObservable.pipe(skipWhile((val => val === null)), take(1), map(res => {
    return res ? { serialNumberAlreadyExists: true } : null;
  }));
};

export const memberNumberAndDnidExistsFactory = (memberNumberAndDnidCombinationExistsObservable:
  Observable< Readonly<{readonly [channelId: string]: boolean}>>) =>
  (type: string) =>
    (control: AbstractControl) => memberNumberAndDnidCombinationExistsObservable.pipe(
      skipWhile((val => val === null || typeof control.parent === 'undefined')), take(1), map(res => {
        return res[control.parent.value.id] === true ? { memberNumberAndDnidCombinationExists: true } : null;
      })
    );

const createNewChannel = (channel: MobileTerminalInterfaces.Channel | null = null, memberNumberAndDnidCombinationExists): FormGroup  => {
  return new FormGroup({
    name: new FormControl(channel === null ? '' : channel.name),
    pollChannel: new FormControl(channel === null ? '' : channel.pollChannel),
    configChannel: new FormControl(channel === null ? '' : channel.configChannel),
    defaultChannel: new FormControl(channel === null ? '' : channel.defaultChannel),
    dnid: new FormControl(
      channel === null ? '' : channel.dnid,
      [Validators.required, CustomValidators.minLengthOfNumber(5), CustomValidators.maxLengthOfNumber(5)],
      memberNumberAndDnidCombinationExists('dnid')
    ),
    memberNumber: new FormControl(
      channel === null ? '' : channel.memberNumber,
      [Validators.required, Validators.min(1), Validators.max(255)],
      memberNumberAndDnidCombinationExists('memberNumber')
    ),
    lesDescription: new FormControl(channel === null ? '' : channel.lesDescription, [Validators.required]),
    startDate: new FormControl(moment(channel === null ? '' : channel.startDate), [CustomValidators.momentValid]),
    endDate: new FormControl(moment(channel === null ? '' : channel.endDate), [CustomValidators.momentValid]),
    expectedFrequency: new FormControl(channel === null ? 60 : channel.expectedFrequency),
    frequencyGracePeriod: new FormControl(channel === null ? 140 : channel.frequencyGracePeriod),
    expectedFrequencyInPort: new FormControl(channel === null ? 140 : channel.expectedFrequencyInPort),
    id: new FormControl(channel === null ? 'temp-' + Math.random().toString(36) : channel.id)
  });
};

export const createMobileTerminalFormValidator = (
  mobileTerminal: MobileTerminalInterfaces.MobileTerminal,
  validateSerialNoExists: (control: AbstractControl) => Observable<{ serialNumberAlreadyExists: boolean }|null>,
  memberNumberAndDnidCombinationExists: (type: string) =>
    (control: AbstractControl) => Observable<{ memberNumberAndDnidCombinationExists: boolean }|null>
): FormGroup => {
  const selectedOceanRegions = [];
  if(mobileTerminal.eastAtlanticOceanRegion) { selectedOceanRegions.push('East Atlantic'); }
  if(mobileTerminal.indianOceanRegion) { selectedOceanRegions.push('Indian'); }
  if(mobileTerminal.pacificOceanRegion) { selectedOceanRegions.push('Pacific'); }
  if(mobileTerminal.westAtlanticOceanRegion) { selectedOceanRegions.push('West Atlantic'); }

  if(selectedOceanRegions.length === 0) {
    selectedOceanRegions.push('Indian');
  }

  const channels = mobileTerminal.channels.map((channel) => createNewChannel(channel, memberNumberAndDnidCombinationExists));
  if(channels.length === 0) {
    channels.push(createNewChannel(null, memberNumberAndDnidCombinationExists));
  }

  return new FormGroup({
    essentailFields: new FormGroup({
      mobileTerminalType: new FormControl(mobileTerminal.mobileTerminalType, Validators.required),
      serialNo: new FormControl(mobileTerminal.serialNo, [Validators.required, alphanumericWithHyphenAndSpace], validateSerialNoExists),
      selectedOceanRegions: new FormControl(selectedOceanRegions, [Validators.required]),
      transceiverType: new FormControl(mobileTerminal.transceiverType, [Validators.required]),
    }),
    mobileTerminalFields: new FormGroup({
      softwareVersion: new FormControl(mobileTerminal.softwareVersion),
      antenna: new FormControl(mobileTerminal.antenna),
      satelliteNumber: new FormControl(mobileTerminal.satelliteNumber),
      active: new FormControl(mobileTerminal.active),
      installDate: new FormControl(moment(mobileTerminal.installDate), [CustomValidators.momentValid]),
      uninstallDate: new FormControl(moment(mobileTerminal.uninstallDate), [CustomValidators.momentValid]),
      installedBy: new FormControl(mobileTerminal.installedBy),
    }),
    channels: new FormArray(channels),
  });
};

export const addChannelToFormValidator = (formValidator: FormGroup, memberNumberAndDnidCombinationExists): void => {
  const channels = formValidator.get('channels') as FormArray;
  channels.push(createNewChannel(null, memberNumberAndDnidCombinationExists));
};

export const removeChannelAtFromFromValidator = (formValidator: FormGroup, index: number): void => {
  const channels = formValidator.get('channels') as FormArray;
  return channels.removeAt(index);
};
