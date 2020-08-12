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
  public filtersChecked = {
    enableChannelFilters: true,
  };

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

  populateFiltersChecked(getMobileTerminalHistoryFilter: MobileTerminalTypes.MobileTerminalHistoryFilter) {
    this.filtersChecked = {
      enableChannelFilters: getMobileTerminalHistoryFilter.filterChannels
    };
  }

  updateFiltersChecked(field: string) {
    if(field === 'enableChannelFilters') {
      if(this.filtersChecked.enableChannelFilters === true) {
        this.removeMobileTerminalHistoryFilters({
          filterChannels: false, channelFields: ['dnid', 'memberNumber', 'name', 'lesDescription']
        });
      } else {
        this.addMobileTerminalHistoryFilters({ filterChannels: true, channelFields: ['dnid', 'memberNumber', 'name', 'lesDescription'] });
      }
    }
  }
}
