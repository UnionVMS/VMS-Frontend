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
  let formValues = {
    id: 'temp-' + Math.random().toString(36),
    name: '',
    pollChannel: false,
    configChannel: false,
    defaultChannel: false,
    dnid: null,
    memberNumber: null,
    lesDescription: '',
    startDate: null,
    endDate: null,
    expectedFrequency: 60,
    frequencyGracePeriod: 140,
    expectedFrequencyInPort: 140,
  };
  if(channel !== null) {
    formValues = {
      id: channel.id,
      name: channel.name,
      pollChannel: channel.pollChannel === null ? false : channel.pollChannel,
      configChannel: channel.configChannel === null ? false : channel.configChannel,
      defaultChannel: channel.defaultChannel === null ? false : channel.defaultChannel,
      dnid: channel.dnid,
      memberNumber: channel.memberNumber,
      lesDescription: channel.lesDescription,
      startDate: typeof channel.startDate === 'undefined' || channel.startDate === null ? null : moment(channel.startDate),
      endDate: typeof channel.endDate === 'undefined' || channel.endDate === null ? null : moment(channel.endDate),
      expectedFrequency: channel.expectedFrequency / (60 * 1000),
      frequencyGracePeriod: channel.frequencyGracePeriod / (60 * 1000),
      expectedFrequencyInPort: channel.expectedFrequencyInPort / (60 * 1000),
    };
  }

  return new FormGroup({
    id: new FormControl(formValues.id),
    name: new FormControl(formValues.name, [Validators.required]),
    pollChannel: new FormControl(formValues.pollChannel),
    configChannel: new FormControl(formValues.configChannel),
    defaultChannel: new FormControl(formValues.defaultChannel),
    dnid: new FormControl(
      formValues.dnid,
      [Validators.required, CustomValidators.minLengthOfNumber(5), CustomValidators.maxLengthOfNumber(5)],
      memberNumberAndDnidCombinationExists('dnid')
    ),
    memberNumber: new FormControl(
      formValues.memberNumber,
      [Validators.required, Validators.min(1), Validators.max(255)],
      memberNumberAndDnidCombinationExists('memberNumber')
    ),
    lesDescription: new FormControl(formValues.lesDescription, [Validators.required]),
    startDate: new FormControl(formValues.startDate, [CustomValidators.momentValid]),
    endDate: new FormControl(formValues.endDate, [CustomValidators.momentValid]),
    expectedFrequency: new FormControl(formValues.expectedFrequency, [Validators.required]),
    frequencyGracePeriod: new FormControl(formValues.frequencyGracePeriod, [Validators.required]),
    expectedFrequencyInPort: new FormControl(formValues.expectedFrequencyInPort, [Validators.required]),
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
    channels = mobileTerminal.channels.slice().sort((c1: MobileTerminalTypes.Channel, c2: MobileTerminalTypes.Channel) => {
      return c1.name.localeCompare(c2.name);
    }).map((channel) => createNewChannel(channel, memberNumberAndDnidCombinationExists));
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
