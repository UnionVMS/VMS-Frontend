import { Component, Input, OnChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NotificationsTypes } from '@data/notifications';

const animationTimeMs = 300;

@Component({
  selector: 'core-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [
    // the fade-in/fade-out animation.
    trigger('dropAndFadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({opacity: 1, 'margin-top': '0px' })),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({opacity: 0, 'margin-top': '-40px'}),
        animate(animationTimeMs)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave',
        animate(animationTimeMs, style({opacity: 0, 'margin-top': '-40px'}))
      )
    ]),
  ]
})

export class NotificationsComponent implements OnChanges {
  @Input() notifications: NotificationsTypes.State;
  @Input() dismiss: (type: string, id: string) => void;
  @Input() overlay: boolean;

  public notificationsVisible = false;
  public lastTimeoutId: number | undefined;

  ngOnChanges() {
    if(
      this.notifications.success.length === 0 &&
      this.notifications.notices.length === 0 &&
      this.notifications.errors.length === 0
    ) {
      // We have to wait for the animation to finish before we remove the wrapping notification container.
      this.lastTimeoutId = window.setTimeout(() => {
        this.notificationsVisible = false;
      }, animationTimeMs);
    } else {
      window.clearTimeout(this.lastTimeoutId);
      this.notificationsVisible = true;
    }
  }

  addConditionalClasses() {
    return this.overlay === true ? 'overlay' : '';
  }
}
