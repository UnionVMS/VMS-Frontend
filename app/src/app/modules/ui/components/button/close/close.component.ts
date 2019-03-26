import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.scss']
})
export class CloseButtonComponent {
  @Input() clickFunction: Function;
}
