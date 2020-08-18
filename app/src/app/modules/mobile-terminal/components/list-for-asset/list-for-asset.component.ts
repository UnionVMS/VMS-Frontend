import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Component({
  selector: 'mobile-terminal-list-for-asset-component',
  templateUrl: './list-for-asset.component.html',
  styleUrls: ['./list-for-asset.component.scss'],
})
export class ListForAssetComponent {
  @Input() mobileTerminals: ReadonlyArray<MobileTerminalTypes.MobileTerminal>;
  @Input() currentMobileTerminal: MobileTerminalTypes.MobileTerminal;
  @Input() selectedAsset: AssetTypes.Asset;
  @Input() changeCurrentMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;

  public saveMobileTerminal: (mobileTerminal: MobileTerminalTypes.MobileTerminal) => void;
  public activeMobileTerminal: MobileTerminalTypes.MobileTerminal;

  changeCurrentMobileTerminalLocal(event: MatTabChangeEvent) {
    this.changeCurrentMobileTerminal(this.mobileTerminals[event.index]);
  }
}
