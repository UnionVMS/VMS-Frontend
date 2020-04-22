import { Component, Input } from '@angular/core';

import { AssetTypes } from '@data/asset';
import { MobileTerminalTypes } from '@data/mobile-terminal';

@Component({
  selector: 'asset-show-mobile-terminal',
  templateUrl: './show-mobile-terminal.component.html',
  styleUrls: ['./show-mobile-terminal.component.scss']
})
export class ShowMobileTerminalComponent {
  @Input() asset: AssetTypes.Asset;
  @Input() mobileTerminals: Array<MobileTerminalTypes.MobileTerminal>;
}
