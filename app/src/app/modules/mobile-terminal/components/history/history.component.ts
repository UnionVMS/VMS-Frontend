import { Component, Input, OnChanges } from '@angular/core';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { MobileTerminalTypes } from '@data/mobile-terminal';

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

  public mobileTerminalHistoryArray: ReadonlyArray<MobileTerminalTypes.MobileTerminalHistory>;
  public historyExpanded: ReadonlyArray<string> = [];
  public filtersChecked: Readonly<{
    mobileTerminalFields: Readonly<{ readonly [field: string]: boolean}>,
    enableChannelFilters: boolean,
    channelFields: Readonly<{ readonly [field: string]: boolean}>,
  }>;

  ngOnChanges() {

    this.populateFiltersChecked(this.mobileTerminalHistoryFilter);

    console.warn(this.mobileTerminalHistoryList);
    this.mobileTerminalHistoryArray = Object.keys(this.mobileTerminalHistoryList).map((id: string) => {
      const mobileTerminalHistory = this.mobileTerminalHistoryList[id];
      const uninstallDate = formatUnixtime(mobileTerminalHistory.snapshot.uninstallDate);
      const installDate = formatUnixtime(mobileTerminalHistory.snapshot.installDate);
      const updatedDate = formatUnixtime(mobileTerminalHistory.updateTime);
      return {
        ...mobileTerminalHistory,
        id,
        installDateFormatted: installDate === '' ? '-' : installDate,
        uninstallDateFormatted: uninstallDate === '' ? '-' : uninstallDate,
        updatedDateFormatted: updatedDate === '' ? '-' : updatedDate,
      };
    });
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

  populateFiltersChecked(mobileTerminalHistoryFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) {
    console.warn(mobileTerminalHistoryFilter.mobileTerminalFields.includes('active'));

    this.filtersChecked = {
      mobileTerminalFields: {
        active: mobileTerminalHistoryFilter.mobileTerminalFields.includes('active'),
        archived: mobileTerminalHistoryFilter.mobileTerminalFields.includes('archived'),
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
        expectedFrequency: mobileTerminalHistoryFilter.channelFields.includes('expectedFrequency'),
        expectedFrequencyInPort: mobileTerminalHistoryFilter.channelFields.includes('expectedFrequencyInPort'),
        frequencyGracePeriod: mobileTerminalHistoryFilter.channelFields.includes('frequencyGracePeriod'),
      }
    };
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
      console.warn('Remove: ', field);
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
