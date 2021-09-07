import { TmplAstRecursiveVisitor } from '@angular/compiler';
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
  @Input() mobileTerminalAssetHistory: MobileTerminalTypes.MobileTerminalAssetHistory;
  public mobileTerminalHistoryArray: ReadonlyArray<ExtendedMobileTerminalHistory>;
  public mobileTerminalCurrentAssetHistoryArray: Array<AssetTypes.Asset>;
  
  private assetNameCounter = 0;
  private lastAssetName = '';

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
      if(typeof mobileTerminalHistory.changesAsObject.assetId !== 'undefined'){
        if(mobileTerminalHistory.assetName){
          if(this.lastAssetName !== mobileTerminalHistory.assetName){
            this.assetNameCounter = 0;
          }
          this.lastAssetName = mobileTerminalHistory.assetName;
          this.assetNameCounter = this.assetNameCounter +1;
        }
        return true;
      }
      if(mobileTerminalHistory.assetName && this.assetNameCounter === 0){

      }
    }).sort((a, b) => b.updateTime - a.updateTime);
  }

  getAssetName(assetName: string, assetId: string) {
    if(assetName){
      return assetName;
    }
    return typeof this.assets !== 'undefined' && typeof this.assets[assetId] !== 'undefined' ? this.assets[assetId].name : assetId;
  }

}
