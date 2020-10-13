import { Component, Input, OnChanges } from '@angular/core';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

type ExtendedMobileTerminalHistory = MobileTerminalTypes.MobileTerminalHistory & {
  id: string;
  installDateFormatted: string;
  uninstallDateFormatted: string;
  updatedDateFormatted: string;
  changesAsObject: Readonly<{
    readonly [changeField: string]: MobileTerminalTypes.MobileTerminalHistoryChange;
  }>;
};

@Component({
  selector: 'mobile-terminal-attachment-history-component',
  templateUrl: './attachment-history.component.html',
  styleUrls: ['./attachment-history.component.scss'],
})
export class AttachmentHistoryComponent implements OnChanges {
  @Input() mobileTerminalHistoryList: MobileTerminalTypes.MobileTerminalHistoryList;
  @Input() assets: Readonly<{ readonly [assetId: string]: AssetTypes.Asset}>;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public mobileTerminalHistoryArray: ReadonlyArray<ExtendedMobileTerminalHistory>;

  ngOnChanges() {
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
        changesAsObject: mobileTerminalHistory.changes.reduce((acc, change) => ({
          ...acc, [change.field]: change
        }), {}),
      };
    }).filter((mobileTerminalHistory: ExtendedMobileTerminalHistory) => {
      return typeof mobileTerminalHistory.changesAsObject.assetId !== 'undefined';
    }).sort((a, b) => b.updateTime - a.updateTime);
  }

  getAssetName(assetId: string) {
    return typeof this.assets !== 'undefined' && typeof this.assets[assetId] !== 'undefined' ? this.assets[assetId].name : assetId;
  }

}
