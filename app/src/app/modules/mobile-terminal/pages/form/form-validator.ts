import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MobileTerminalTypes } from '@data/mobile-terminal';
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
  const REGEXP = /^[a-z0-9\- ]*$/i;
  return c.value === null || c.value.length === 0 || REGEXP.test(c.value) ? null : {
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
      skipWhile(val => val === null || typeof control.parent === 'undefined' || val[control.parent.value.id] === null),
      take(1),
      map(res => {
        return res[control.parent.value.id] === true ? { memberNumberAndDnidCombinationExists: true } : null;
      })
    );

const createNewChannel = (
  channel: MobileTerminalTypes.Channel | null = null,
  memberNumberAndDnidCombinationExists: (type: string) =>
    (control: AbstractControl) => Observable<{ memberNumberAndDnidCombinationExists: boolean }|null>
): FormGroup  => {
  return new FormGroup({
    id: new FormControl(channel === null ? 'temp-' + Math.random().toString(36) : channel.id),
    name: new FormControl(channel === null ? '' : channel.name),
    pollChannel: new FormControl(channel === null || channel.pollChannel === null ? false : channel.pollChannel),
    configChannel: new FormControl(channel === null || channel.configChannel === null ? false : channel.configChannel),
    defaultChannel: new FormControl(channel === null || channel.defaultChannel === null ? false : channel.defaultChannel),
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
    startDate: new FormControl(
      (channel === null || typeof channel.startDate === 'undefined' || channel.startDate === null
        ? null
        : moment(channel.startDate)
      ),
      [CustomValidators.momentValid]),
    endDate: new FormControl(
      (channel === null || typeof channel.endDate === 'undefined' || channel.endDate === null
        ? null
        : moment(channel.endDate)
      ),
      [CustomValidators.momentValid]),
    expectedFrequency: new FormControl(channel === null ? 60 : channel.expectedFrequency),
    frequencyGracePeriod: new FormControl(channel === null ? 140 : channel.frequencyGracePeriod),
    expectedFrequencyInPort: new FormControl(channel === null ? 140 : channel.expectedFrequencyInPort),
  });
};

export const createMobileTerminalFormValidator = (
  mobileTerminal: MobileTerminalTypes.MobileTerminal,
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

  let channels = [];
  if(mobileTerminal.channels !== undefined) {
    channels = mobileTerminal.channels.map((channel) => createNewChannel(channel, memberNumberAndDnidCombinationExists));
  }
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
      installDate: new FormControl(
        (typeof mobileTerminal.installDate === 'undefined' || mobileTerminal.installDate === null
          ? null
          : moment(mobileTerminal.installDate)
        ),
        [CustomValidators.momentValid]
      ),
      uninstallDate: new FormControl(
        (typeof mobileTerminal.uninstallDate === 'undefined' || mobileTerminal.uninstallDate === null
          ? null
          : moment(mobileTerminal.uninstallDate)
        ),
        [CustomValidators.momentValid]
      ),
      installedBy: new FormControl(mobileTerminal.installedBy),
    }),
    channels: new FormArray(channels),
  });
};

export const addChannelToFormValidator = (
  formValidator: FormGroup,
  memberNumberAndDnidCombinationExists: (type: string) =>
    (control: AbstractControl) => Observable<{ memberNumberAndDnidCombinationExists: boolean }|null>
): void => {
  const channels = formValidator.get('channels') as FormArray;
  channels.push(createNewChannel(null, memberNumberAndDnidCombinationExists));
};

export const removeChannelAtFromFromValidator = (formValidator: FormGroup, index: number): void => {
  const channels = formValidator.get('channels') as FormArray;
  return channels.removeAt(index);
};
