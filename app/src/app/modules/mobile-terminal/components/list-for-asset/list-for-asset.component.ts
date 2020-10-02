import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'mobile-terminal-list-for-asset-component',
  templateUrl: './list-for-asset.component.html',
  styleUrls: ['./list-for-asset.component.scss'],
})
export class ListForAssetComponent implements OnChanges {
  @Input() mobileTerminals: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  @Input() currentMobileTerminal: MobileTerminalTypes.MobileTerminal;
  @Input() selectedAsset: AssetTypes.Asset;
  @Input() changeCurrentMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  public activeMobileTerminal: MobileTerminalTypes.MobileTerminal;
  public formattedMobileTerminals: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;

  ngOnChanges() {
    this.formattedMobileTerminals = this.mobileTerminals.map((mobileTerminal: MobileTerminalTypes.MobileTerminal) => ({
      ...mobileTerminal,
      installDateFormatted: formatUnixtime(mobileTerminal.installDate),
      uninstallDateFormatted: formatUnixtime(mobileTerminal.uninstallDate),
      channels: mobileTerminal.channels.slice().sort((c1: MobileTerminalTypes.Channel, c2: MobileTerminalTypes.Channel) => {
        return c1.name.localeCompare(c2.name);
      }).map(channel => ({
        ...channel,
        startDateFormatted: formatUnixtime(channel.startDate),
        endDateFormatted: formatUnixtime(channel.endDate)
      }))
    }));
  }

  changeCurrentMobileTerminalLocal(event: MatTabChangeEvent) {
    this.changeCurrentMobileTerminal(this.mobileTerminals[event.index]);
  }
}
