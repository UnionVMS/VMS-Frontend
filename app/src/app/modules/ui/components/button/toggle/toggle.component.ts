import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleButtonComponent {
  @Input() label: string;
  @Input() value: boolean;
  @Input() switchFunction: Function;
  @Input() size: string;
}
