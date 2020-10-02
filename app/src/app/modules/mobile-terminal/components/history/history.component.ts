import { Component, Input, OnChanges } from '@angular/core';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { MobileTerminalTypes, MobileTerminalReducer } from '@data/mobile-terminal';

type ExtendedMobileTerminalHistory = MobileTerminalTypes.MobileTerminalHistory & {
  id: string;
  installDateFormatted: string;
  uninstallDateFormatted: string;
  updatedDateFormatted: string;
  changesAsObject: Readonly<{
    readonly [changeField: string]: MobileTerminalTypes.MobileTerminalHistoryChange;
  }>;
  channelChanges: Readonly<{
    readonly [channelId: string]: {
      changeType: MobileTerminalTypes.MobileTerminalChangeType;
      changes: Readonly<{
        readonly [fieldName: string]: MobileTerminalTypes.MobileTerminalHistoryChange
      }>
    }
  }>
};

@Component({
  selector: 'mobile-terminal-history-component',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnChanges {
  @Input() mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList;
  @Input() mobileTerminalHistoryFilter: MobileTerminalTypes.MobileTerminalHistoryFilter;
  @Input() addMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;
  @Input() removeMobileTerminalHistoryFilters: (historyFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) => void;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public mobileTerminalHistoryArray: ReadonlyArray<ExtendedMobileTerminalHistory>;
  public filtersVisible = true;
  public historyExpanded: ReadonlyArray<string> = [];
  public filtersChecked: Readonly<{
    mobileTerminalFields: Readonly<{ readonly [field: string]: boolean}>,
    enableChannelFilters: boolean,
    channelFields: Readonly<{ readonly [field: string]: boolean}>,
  }>;
  public allFieldsChecked: boolean;
  public someFieldsChecked: boolean;

  ngOnChanges() {
    this.populateFiltersChecked(this.mobileTerminalHistoryFilter);
    this.allFieldsChecked = this.isAllFieldsChecked();
    this.someFieldsChecked = !this.allFieldsChecked && (
      this.mobileTerminalHistoryFilter.mobileTerminalFields.length > 1 ||
      this.mobileTerminalHistoryFilter.filterChannels === true
    );

    this.mobileTerminalHistoryArray = Object.keys(this.mobileTerminalHistoryList).map((id: string) => {
      const mobileTerminalHistory = this.mobileTerminalHistoryList[id];
      const uninstallDate = formatUnixtime(mobileTerminalHistory.snapshot.uninstallDate);
      const installDate = formatUnixtime(mobileTerminalHistory.snapshot.installDate);
      const updatedDate = formatUnixtime(mobileTerminalHistory.updateTime);
      const oceanRegions = ['eastAtlanticOceanRegion', 'indianOceanRegion', 'pacificOceanRegion', 'westAtlanticOceanRegion'];
      return {
        ...mobileTerminalHistory,
        id,
        installDateFormatted: installDate === '' ? '-' : installDate,
        uninstallDateFormatted: uninstallDate === '' ? '-' : uninstallDate,
        updatedDateFormatted: updatedDate === '' ? '-' : updatedDate,
        changesAsObject: mobileTerminalHistory.changes.reduce((acc, change) => {
          if(oceanRegions.includes(change.field)) {
            // @ts-ignore
            return { ...acc, oceanRegions: { ...acc.oceanRegions, [change.field]: change } };
          }
          return { ...acc, [change.field]: change };
        }, {}),
        channelChanges: Object.keys(mobileTerminalHistory.channelChanges).reduce((acc, channelId) => {
          const channelChange = mobileTerminalHistory.channelChanges[channelId];
          return {
            ...acc,
            [channelId]: {
              ...channelChange,
              changes: channelChange.changes.reduce((channelChanges, change) => {
                return { ...channelChanges, [change.field]: change };
              }, {})
            }
          };
        }, {}),
        snapshot: {
          ...mobileTerminalHistory.snapshot,
          formattedChannels: mobileTerminalHistory.snapshot.channels.map(channel => {
            const type = [];
            if(channel.configChannel) {
              type.push('Config');
            }
            if(channel.defaultChannel) {
              type.push('Default');
            }
            if(channel.pollChannel) {
              type.push('Poll');
            }
            const startDate = formatUnixtime(channel.startDate);
            const endDate = formatUnixtime(channel.endDate);
            return {
              ...channel,
              type: type.join(', '),
              startDate: startDate === '' ? '-' : startDate,
              endDate: endDate === '' ? '-' : endDate,
              expectedFrequency: channel.expectedFrequency / 1000 / 60,
              frequencyGracePeriod: channel.frequencyGracePeriod / 1000 / 60,
              expectedFrequencyInPort: channel.expectedFrequencyInPort / 1000 / 60,
            };
          })
        }
      };
    }).sort((a, b) => {
      if(a.updateTime > b.updateTime) {
        return -1;
      } else if(a.updateTime < b.updateTime) {
        return 1;
      }
      return 0;
    });
  }

  toggleShowFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  isHistoryExpanded(historyId: string) {
    return this.historyExpanded.includes(historyId);
  }

  toggleHistory(historyId: string) {
    if(this.historyExpanded.includes(historyId)) {
      this.historyExpanded = this.historyExpanded.filter((id) => historyId !== id);
    } else {
      this.historyExpanded = [
        ...this.historyExpanded,
        historyId
      ];
    }
  }

  isAllFieldsChecked() {
    const missingMobileTerminalField = MobileTerminalReducer.allMobileTerminalFields.find((field) => {
      return !this.mobileTerminalHistoryFilter.mobileTerminalFields.includes(field);
    });

    const missingChannelField = MobileTerminalReducer.allChannelFields.find((field) => {
      return !this.mobileTerminalHistoryFilter.channelFields.includes(field);
    });

    return typeof missingMobileTerminalField === 'undefined' &&
      this.mobileTerminalHistoryFilter.filterChannels === true &&
      typeof missingChannelField === 'undefined';
  }

  populateFiltersChecked(mobileTerminalHistoryFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) {
    this.filtersChecked = {
      mobileTerminalFields: {
        active: mobileTerminalHistoryFilter.mobileTerminalFields.includes('active'),
        archived: mobileTerminalHistoryFilter.mobileTerminalFields.includes('archived'),
        assetId: mobileTerminalHistoryFilter.mobileTerminalFields.includes('assetId'),
        mobileTerminalType: mobileTerminalHistoryFilter.mobileTerminalFields.includes('mobileTerminalType'),
        oceanRegion: mobileTerminalHistoryFilter.mobileTerminalFields.includes('eastAtlanticOceanRegion'),
        transceiverType: mobileTerminalHistoryFilter.mobileTerminalFields.includes('transceiverType'),
        satelliteNumber: mobileTerminalHistoryFilter.mobileTerminalFields.includes('satelliteNumber'),
        softwareVersion: mobileTerminalHistoryFilter.mobileTerminalFields.includes('softwareVersion'),
        antenna: mobileTerminalHistoryFilter.mobileTerminalFields.includes('antenna'),
        installDate: mobileTerminalHistoryFilter.mobileTerminalFields.includes('installDate'),
        installedBy: mobileTerminalHistoryFilter.mobileTerminalFields.includes('installedBy'),
        uninstallDate: mobileTerminalHistoryFilter.mobileTerminalFields.includes('uninstallDate'),
      },
      enableChannelFilters: mobileTerminalHistoryFilter.filterChannels,
      channelFields: {
        startDate: mobileTerminalHistoryFilter.channelFields.includes('startDate'),
        endDate: mobileTerminalHistoryFilter.channelFields.includes('endDate'),
        active: mobileTerminalHistoryFilter.channelFields.includes('active'),
        archived: mobileTerminalHistoryFilter.channelFields.includes('archived'),
        channel: mobileTerminalHistoryFilter.channelFields.includes('configChannel'),
        lesDescription: mobileTerminalHistoryFilter.channelFields.includes('lesDescription'),
        expectedFrequency: mobileTerminalHistoryFilter.channelFields.includes('expectedFrequency'),
        expectedFrequencyInPort: mobileTerminalHistoryFilter.channelFields.includes('expectedFrequencyInPort'),
        frequencyGracePeriod: mobileTerminalHistoryFilter.channelFields.includes('frequencyGracePeriod'),
      }
    };
  }

  getMobileTerminalHeaderCssClass(mobileTerminalHistory: ExtendedMobileTerminalHistory) {
    if(typeof mobileTerminalHistory.changesAsObject.archived !== 'undefined') {
      return ' archived';
    }
    return mobileTerminalHistory.changeType === 'CREATED' ? ' created' : '';
  }

  getChangedClass(fieldChanged: MobileTerminalTypes.MobileTerminalHistoryChange) {
    return typeof fieldChanged !== 'undefined' ? ' changed' : '';
  }

  getChangedClassForChannel(fieldChanged: MobileTerminalTypes.ChannelChange, field: string) {
    if(typeof fieldChanged !== 'undefined') {
      return typeof fieldChanged.changes[field] !== 'undefined' ? 'changed' : '';
    }
    return '';
  }

  getChannelRowClass(channelChange: MobileTerminalTypes.ChannelChange) {
    if(typeof channelChange !== 'undefined') {
      return channelChange.changeType.toLowerCase();
    }

    return '';
  }

  getRemovedChannels(mobileTerminalHistory: ExtendedMobileTerminalHistory) {
    const deletedChannels =  Object.values(mobileTerminalHistory.channelChanges)
      .filter(channelChange => channelChange.changeType === MobileTerminalTypes.MobileTerminalChangeType.REMOVED)
      .map(channelChange => {
        const type = [];
        if(typeof channelChange.changes.configChannel !== 'undefined') {
          type.push('Config');
        }
        if(typeof channelChange.changes.defaultChannel !== 'undefined') {
          type.push('Default');
        }
        if(typeof channelChange.changes.pollChannel !== 'undefined') {
          type.push('Poll');
        }
        return {
          dnid: channelChange.changes.dnid.oldValue,
          type,
          memberNumber: channelChange.changes.memberNumber.oldValue,
          lesDescription: channelChange.changes.lesDescription.oldValue,
          startDate: channelChange.changes.startDate?.oldValue,
          endDate: channelChange.changes.endDate?.oldValue,
          expectedFrequency: channelChange.changes.expectedFrequency?.oldValue,
          expectedFrequencyInPort: channelChange.changes.expectedFrequencyInPort?.oldValue,
          frequencyGracePeriod: channelChange.changes.frequencyGracePeriod?.oldValue,
        };
      });
    return deletedChannels;
  }

  getOceanRegionsValue(mobileTerminal: MobileTerminalTypes.MobileTerminal) {
    const oceanRegions = [];
    if(mobileTerminal.eastAtlanticOceanRegion) {
      oceanRegions.push('East Atlantic');
    }
    if(mobileTerminal.westAtlanticOceanRegion) {
      oceanRegions.push('West Atlantic');
    }
    if(mobileTerminal.pacificOceanRegion) {
      oceanRegions.push('Pacific');
    }
    if(mobileTerminal.indianOceanRegion) {
      oceanRegions.push('Indian');
    }
    return oceanRegions.join(', ');
  }

  toggleAll() {
    if(this.allFieldsChecked) {
      this.removeMobileTerminalHistoryFilters({
        mobileTerminalFields: MobileTerminalReducer.allMobileTerminalFields,
        filterChannels: false,
        channelFields: MobileTerminalReducer.allChannelFields
      });
    } else {
      this.addMobileTerminalHistoryFilters({
        mobileTerminalFields: MobileTerminalReducer.allMobileTerminalFields,
        filterChannels: true,
        channelFields: MobileTerminalReducer.allChannelFields
      });
    }
  }

  updateFiltersChecked(base: string, field?: string) {
    if(base === 'enableChannelFilters') {
      if(this.filtersChecked.enableChannelFilters === true) {
        this.removeMobileTerminalHistoryFilters({
          filterChannels: false, channelFields: ['dnid', 'memberNumber', 'name', 'lesDescription']
        });
      } else {
        this.addMobileTerminalHistoryFilters({ filterChannels: true, channelFields: ['dnid', 'memberNumber', 'name', 'lesDescription'] });
      }
    } else if (this.filtersChecked[base][field] === true) {
      if (field === 'oceanRegion') {
        this.removeMobileTerminalHistoryFilters({
          mobileTerminalFields: ['eastAtlanticOceanRegion', 'indianOceanRegion', 'pacificOceanRegion', 'westAtlanticOceanRegion']
        });
      } else if(field === 'channel') {
        this.removeMobileTerminalHistoryFilters({
          channelFields: ['configChannel', 'pollChannel', 'defaultChannel']
        });
      } else {
        this.removeMobileTerminalHistoryFilters({ [base]: [field] });
      }
    } else {
      if (field === 'oceanRegion') {
        this.addMobileTerminalHistoryFilters({
          mobileTerminalFields: ['eastAtlanticOceanRegion', 'indianOceanRegion', 'pacificOceanRegion', 'westAtlanticOceanRegion']
        });
      } else if(field === 'channel') {
        this.addMobileTerminalHistoryFilters({
          channelFields: ['configChannel', 'pollChannel', 'defaultChannel']
        });
      } else {
        this.addMobileTerminalHistoryFilters({ [base]: [field] });
      }
    }
  }
}
