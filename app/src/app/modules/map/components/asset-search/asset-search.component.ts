import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';

@Component({
  selector: 'map-asset-search',
  templateUrl: './asset-search.component.html',
  styleUrls: ['./asset-search.component.scss']
})
export class AssetSearchComponent {
  // tslint:disable-next-line:ban-types
  @Input() inputSearchFunction: Function;

  public searchQuery = '';

  public searchKeyUp = (event): void => {
    if (event.key === 'Enter') {
      this.inputSearchFunction(this.searchQuery);
    }
  }
}
