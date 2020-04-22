import { Component, Input } from '@angular/core';

import { AssetTypes } from '@data/asset';
import { ContactTypes } from '@data/contact';

@Component({
  selector: 'asset-show-contacts',
  templateUrl: './show-contacts.component.html',
  styleUrls: ['./show-contacts.component.scss']
})
export class ShowContactsComponent {
  @Input() asset: AssetTypes.Asset;
  @Input() contacts: Array<ContactTypes.Contact>;
}
