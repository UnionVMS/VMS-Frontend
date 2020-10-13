import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';
import { formatUnixtime } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'mobile-terminal-show-component',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
})
export class ShowComponent implements OnChanges {
  @Input() mobileTerminal: MobileTerminalTypes.MobileTerminal;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  public activeMobileTerminal: MobileTerminalTypes.MobileTerminal;
  public formattedMobileTerminal: MobileTerminalTypes.MobileTerminal & {
    installDateFormatted: string;
    uninstallDateFormatted: string;
  };

  ngOnChanges() {
    this.formattedMobileTerminal = {
      ...this.mobileTerminal,
      installDateFormatted: formatUnixtime(this.mobileTerminal.installDate),
      uninstallDateFormatted: formatUnixtime(this.mobileTerminal.uninstallDate),
      channels: this.mobileTerminal.channels.slice().sort((c1: MobileTerminalTypes.Channel, c2: MobileTerminalTypes.Channel) => {
        return c1.name.localeCompare(c2.name);
      }).map(channel => ({
        ...channel,
        startDateFormatted: formatUnixtime(channel.startDate),
        endDateFormatted: formatUnixtime(channel.endDate)
      }))
    };
  }
}
