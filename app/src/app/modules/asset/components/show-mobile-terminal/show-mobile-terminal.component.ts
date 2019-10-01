import { Component, Input } from '@angular/core';

import { AssetInterfaces } from '@data/asset';
import { MobileTerminalInterfaces } from '@data/mobile-terminal';

@Component({
  selector: 'asset-show-mobile-terminal',
  templateUrl: './show-mobile-terminal.component.html',
  styleUrls: ['./show-mobile-terminal.component.scss']
})
export class ShowMobileTerminalComponent {
  @Input() asset: AssetInterfaces.Asset;
  @Input() mobileTerminals: Array<MobileTerminalInterfaces.MobileTerminal>;
}
