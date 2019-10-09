import { Component, Input } from '@angular/core';

import { AssetInterfaces } from '@data/asset';
import { ContactInterfaces } from '@data/contact';

@Component({
  selector: 'asset-show-contacts',
  templateUrl: './show-contacts.component.html',
  styleUrls: ['./show-contacts.component.scss']
})
export class ShowContactsComponent {
  @Input() asset: AssetInterfaces.Asset;
  @Input() contacts: Array<ContactInterfaces.Contact>;
}
