import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MobileTerminalInterfaces } from '@data/mobile-terminal';
import CustomValidators from '@validators/.';

interface MobileTerminalFormValidator {
  essentailFields: FormGroup;
  mobileTerminalFields: FormGroup;
  channels: FormArray;
}

const createNewChannel = (channel: MobileTerminalInterfaces.Channel | null = null): FormGroup => {
  return new FormGroup({
    name: new FormControl(channel === null ? '' : channel.name),
    pollChannel: new FormControl(channel === null ? '' : channel.pollChannel),
    configChannel: new FormControl(channel === null ? '' : channel.configChannel),
    defaultChannel: new FormControl(channel === null ? '' : channel.defaultChannel),
    dnid: new FormControl(
      channel === null ? '' : channel.dnid,
      [Validators.required, Validators.minLength(5), Validators.maxLength(5)]
    ),
    memberNumber: new FormControl(
      channel === null ? '' : channel.memberNumber,
      [Validators.required, Validators.min(1), Validators.max(255)]
    ),
    lesDescription: new FormControl(channel === null ? '' : channel.lesDescription),
    installedBy: new FormControl(channel === null ? '' : channel.installedBy),
    startDate: new FormControl(channel === null ? '' : channel.startDate),
    endDate: new FormControl(channel === null ? '' : channel.endDate),
    installDate: new FormControl(channel === null ? '' : channel.installDate),
    uninstallDate: new FormControl(channel === null ? '' : channel.uninstallDate),
    expectedFrequency: new FormControl(channel === null ? '' : channel.expectedFrequency),
    frequencyGracePeriod: new FormControl(channel === null ? '' : channel.frequencyGracePeriod),
    expectedFrequencyInPort: new FormControl(channel === null ? '' : channel.expectedFrequencyInPort),
    id: new FormControl(channel === null ? '' : channel.id),
  });
};

export const createMobileTerminalFormValidator = (mobileTerminal: MobileTerminalInterfaces.MobileTerminal): FormGroup => {
  const selectedOceanRegions = [];
  if(mobileTerminal.eastAtlanticOceanRegion) { selectedOceanRegions.push('East Atlantic'); }
  if(mobileTerminal.indianOceanRegion) { selectedOceanRegions.push('Indian'); }
  if(mobileTerminal.pacificOceanRegion) { selectedOceanRegions.push('Pacific'); }
  if(mobileTerminal.westAtlanticOceanRegion) { selectedOceanRegions.push('West Atlantic'); }

  if(selectedOceanRegions.length === 0) {
    selectedOceanRegions.push('Indian');
  }

  return new FormGroup({
    essentailFields: new FormGroup({
      mobileTerminalType: new FormControl(mobileTerminal.mobileTerminalType, Validators.required),
      serialNo: new FormControl(mobileTerminal.serialNo, [Validators.required, CustomValidators.alphanumeric]),
      selectedOceanRegions: new FormControl(selectedOceanRegions, [Validators.required]),
    }),
    mobileTerminalFields: new FormGroup({
      transceiverType: new FormControl(mobileTerminal.transceiverType),
      softwareVersion: new FormControl(mobileTerminal.softwareVersion),
      antenna: new FormControl(mobileTerminal.antenna),
      satelliteNumber: new FormControl(mobileTerminal.satelliteNumber),
      active: new FormControl(mobileTerminal.active),
    }),
    channels: new FormArray(mobileTerminal.channels.map((channel) => createNewChannel(channel))),
  });
};

export const addChannelToFormValidator = (formValidator: FormGroup): void => {
  const channels = formValidator.get('channels') as FormArray;
  channels.push(createNewChannel());
};

export const removeChannelAtFromFromValidator = (formValidator: FormGroup, index: number): void => {
  const channels = formValidator.get('channels') as FormArray;
  return channels.removeAt(index);
};
