export interface Channel {
  active: boolean;
  archived: boolean;
  configChannel: boolean;
  defaultChannel: boolean;
  dnid: string;
  endDate: string;
  expectedFrequency: number;
  expectedFrequencyInPort: number;
  frequencyGracePeriod: number;
  historyId: string;
  id: string;
  installDate: string;
  installedBy: string;
  lesDescription: string;
  memberNumber: string;
  name: string;
  pollChannel: boolean;
  startDate: string;
  uninstallDate: string;
  updateTime: string;
  updateUser: string;
}

export interface Capability {
  id: string;
  name: string;
  plugin: string;
  updateTime: string;
  updatedBy: string;
  value: string;
}

export interface Plugin {
  capabilities: Array<Capability>;
  description: string;
  id: string;
  name: string;
  pluginInactive: boolean;
  pluginSatelliteType: string;
  pluginServiceName: string;
  updateTime: string;
  updatedBy: string;
}

export interface MobileTerminal {
  antenna: string;
  archived: boolean;
  assetId: string;
  channels: Array<Channel>;
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
  updatetime: string;
  updateuser: string;
  westAtlanticOceanRegion: boolean;
}

export interface State {
  mobileTerminals: Array<MobileTerminal>;
}
