export type Channel = Readonly<{
  active: boolean;
  archived: boolean;
  configChannel: boolean;
  defaultChannel: boolean;
  dnid: number;
  endDate: number;
  expectedFrequency: number;
  expectedFrequencyInPort: number;
  frequencyGracePeriod: number;
  historyId: string;
  id: string;
  lesDescription: string;
  memberNumber: number;
  name: string;
  pollChannel: boolean;
  startDate: number;
  updateTime: number;
  updateUser: string;
}>;

export type Capability = Readonly<{
  id: string;
  name: string;
  plugin: string;
  updateTime: string;
  updatedBy: string;
  value: string;
}>;

export type Plugin = Readonly<{
  capabilities: ReadonlyArray<Capability>;
  description: string;
  id: string;
  name: string;
  pluginInactive: boolean;
  pluginSatelliteType: string;
  pluginServiceName: string;
  updateTime: string;
  updatedBy: string;
}>;

export type MobileTerminal = Readonly<{
  asset?: any; // TODO: Remove this when backend is ready.
  active: boolean;
  antenna: string;
  archived: boolean;
  assetId: string;
  channels: ReadonlyArray<Channel>;
  comment: string;
  createTime: string;
  eastAtlanticOceanRegion: boolean;
  historyId: string;
  id: string;
  inactivated: boolean;
  indianOceanRegion: boolean;
  mobileTerminalType: string;
  pacificOceanRegion: boolean;
  plugin: Plugin;
  satelliteNumber: string;
  serialNo: string;
  softwareVersion: string;
  source: string;
  transceiverType: string;
  installDate: number;
  installedBy: string;
  uninstallDate: number;
  updatetime: string;
  updateuser: string;
  westAtlanticOceanRegion: boolean;
}>;

export type Transponder = Readonly<{
  terminalSystemType: string;
}>;

export type FormFieldsValid = Readonly<{
  serialNumberExists: boolean | null;
  memberNumberAndDnidCombinationExists: Readonly<{
    readonly [channelId: string]: boolean | null;
  }>;
}>;

export type State = Readonly<{
  mobileTerminals: Readonly<{ readonly [id: string]: MobileTerminal }>;
  transponders: ReadonlyArray<Transponder>;
  plugins: ReadonlyArray<Plugin>;
  formFieldsValid: FormFieldsValid;
  searchResults: Readonly<{ readonly [hash: number]: ReadonlyArray<string> }>;
  lastSearchHash: number;
  createWithSerialNo: string;
}>;
