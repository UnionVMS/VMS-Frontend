import { Component, Input } from '@angular/core';
import { NotificationsTypes } from '@data/notifications';

@Component({
  selector: 'core-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent {
  @Input() notifications: NotificationsTypes.State;
  @Input() dismiss: (type: string, id: string) => void;
  @Input() overlay: boolean;

  addConditionalClasses() {
    return this.overlay === true ? 'overlay' : '';
  }
}
