import { Component, Input, Output, OnChanges, OnInit } from '@angular/core';
import { formatDate } from '../../../../helpers/helpers';

@Component({
  selector: 'map-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.scss']
})
export class InformationPanelComponent {
  @Input() hideFunction: () => void;
  public hidePanel = true;
}
