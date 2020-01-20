import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MobileTerminalInterfaces } from '@data/mobile-terminal';
import { map, take, skip, toArray } from 'rxjs/operators';
import CustomValidators from '@validators/.';
import { Observable } from 'rxjs';

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
  return (control: AbstractControl) => serialNoObservable.pipe(skip(1), take(1), map(res => {
    return res ? { serialNumberAlreadyExists: true } : null;
  }));
}

export const memberNumberAndDnidExistsFactory = (memberNumberAndDnidCombinationExistsObservable: Observable<boolean>) => {
  return (control: AbstractControl) => memberNumberAndDnidCombinationExistsObservable.pipe( take(5), toArray(), map(res => {
    console.warn("res: ", res)
    let someinvalid = false
    res.forEach( (valValue) =>{
      if(valValue){
        someinvalid = true
      }
    });
    return someinvalid ? { memberNumberAndDnidCombinationExists: true } : null;
  }));
}

//const createNewChannel = (channel: MobileTerminalInterfaces.Channel | null = null): FormGroup => {
const createNewChannel = (channel: MobileTerminalInterfaces.Channel, memberNumberAndDnidCombinationExists): FormGroup  => {
  console.warn("channel ",channel)
  return new FormGroup({
    name: new FormControl(channel === null ? '' : channel.name),
    pollChannel: new FormControl(channel === null ? '' : channel.pollChannel),
    configChannel: new FormControl(channel === null ? '' : channel.configChannel),
    defaultChannel: new FormControl(channel === null ? '' : channel.defaultChannel),
    dnid: new FormControl(
      channel === null ? '' : channel.dnid,
      [Validators.required, CustomValidators.minLengthOfNumber(5), CustomValidators.maxLengthOfNumber(5)],
      memberNumberAndDnidCombinationExists
    ),
    memberNumber: new FormControl(
      channel === null ? '' : channel.memberNumber,
      [Validators.required, Validators.min(1), Validators.max(255)],
      memberNumberAndDnidCombinationExists
    ),
    lesDescription: new FormControl(channel === null ? '' : channel.lesDescription, [Validators.required]),
    startDate: new FormControl(channel === null ? '' : channel.startDate),
    endDate: new FormControl(channel === null ? '' : channel.endDate),
    expectedFrequency: new FormControl(channel === null ? 60 : channel.expectedFrequency),
    frequencyGracePeriod: new FormControl(channel === null ? 140 : channel.frequencyGracePeriod),
    expectedFrequencyInPort: new FormControl(channel === null ? 140 : channel.expectedFrequencyInPort),
    id: new FormControl(channel === null ? '' : channel.id),
  });
};

export const createMobileTerminalFormValidator = (mobileTerminal: MobileTerminalInterfaces.MobileTerminal, validateSerialNoExists, memberNumberAndDnidCombinationExists): FormGroup => {
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
      installDate: new FormControl(mobileTerminal.installDate),
      uninstallDate: new FormControl(mobileTerminal.uninstallDate),
      installedBy: new FormControl(mobileTerminal.installedBy),
    }),
    channels: new FormArray(channels),
  });
};

export const addChannelToFormValidator = (formValidator: FormGroup): void => {
  const channels = formValidator.get('channels') as FormArray;
  channels.push(createNewChannel(null, null));
};

export const removeChannelAtFromFromValidator = (formValidator: FormGroup, index: number): void => {
  const channels = formValidator.get('channels') as FormArray;
  return channels.removeAt(index);
};

export const validateSerialNumberFromValidator = (): void => {
};

export const validateMemberNumberAndDnidFromValidator = (): void => {

};


