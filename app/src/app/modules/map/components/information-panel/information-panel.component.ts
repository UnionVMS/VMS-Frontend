import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';

@Component({
  selector: 'map-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.scss']
})
export class InformationPanelComponent {
  public hidePanel = true;
  public toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }
}
