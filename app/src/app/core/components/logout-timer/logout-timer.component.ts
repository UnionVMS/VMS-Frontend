import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'core-logout-timer-component',
  templateUrl: './logout-timer.component.html',
  styleUrls: ['./logout-timer.component.scss']
})
export class LogoutTimerComponent implements OnChanges {
  @Input() timeToLogout: number | null;

  /** Reference to the directive instance of the ripple. */
  @ViewChild(MatRipple) ripple: MatRipple;

  public showLogoutTimer = false;
  public timeToLogoutFormatted: number | null;

  ngOnChanges() {
    if(this.timeToLogout === undefined || this.timeToLogout === null) {
      this.showLogoutTimer = false;
    } else {
      this.showLogoutTimer = true;
      const newTimeToLogout = Math.ceil(this.timeToLogout / 60);
      if(newTimeToLogout !== this.timeToLogoutFormatted) {
        this.timeToLogoutFormatted = newTimeToLogout;
        this.launchRipple();
      }
    }
  }

  /** Shows a centered and persistent ripple. */
  launchRipple() {
    if(this.ripple !== undefined) {
      const rippleRef = this.ripple.launch({
        persistent: true,
        centered: true,
        color: '#FFFFFF',

      });

      // Fade out the ripple later.
      rippleRef.fadeOut();
    }
  }
}
