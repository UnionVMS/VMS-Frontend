import { Component, Input, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';


// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'core-efr-top-menu-component',
  templateUrl: './efr-top-menu.component.html',
  styleUrls: ['./efr-top-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EfrTopMenuComponent implements OnInit, OnChanges {

  @Input() appVersion: string;
  @Input() isAdmin: boolean;
  @Input() setTimezone: (timezone: string) => void;
  @Input() timezone: string;
  @Input() fishingActivityUnlocked: boolean;
  @Input() timeToLogout: number | null;

  public baseUrl = window.location.origin;
  public currentTimezone: string;
  public timezones: string[];

  ngOnInit() {
    this.timezones = moment.tz.names();
  }

  ngOnChanges() {
    this.currentTimezone = this.timezone;
  }

  getTimeToLogout() {
    return Math.ceil(this.timeToLogout / 60);
  }
}
