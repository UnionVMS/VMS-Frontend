import { Component, Input, OnInit, OnChanges, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { Router } from '@angular/router';

// @ts-ignore
import moment from 'moment-timezone';
import { formatUnixtimeWithoutDate } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'core-top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TopMenuComponent implements OnInit, OnChanges, OnDestroy {

  @Input() appVersion: string;
  @Input() isAdmin: boolean;
  @Input() setTimezone: (timezone: string) => void;
  @Input() currentTimezone: string;
  @Input() fishingActivityUnlocked: boolean;
  @Input() timeToLogout: number | null;
  @Input() url: string;

  public baseUrl = window.location.origin;
  public timezones: string[];
  public assetTabActive: boolean;
  public commonTimezones = ['Europe/Stockholm', 'UTC'];
  public currentTime: string;

  private intervalId: number;

  ngOnInit() {
    // Remove afew timezones. GMT because moment.js inverts GMT timezones.
    // Remove ETC/ because they are duplicates.
    // Remove UCT to prevent user from picking wrong when going for UTC.
    this.timezones = moment.tz.names().filter((name: string) =>
      !name.toLowerCase().includes('gmt') &&
      !name.toLowerCase().includes('uct') &&
      !name.toLowerCase().includes('etc/') &&
      !this.commonTimezones.includes(name)
    );

    this.intervalId = window.setInterval(() => {
      this.currentTime = formatUnixtimeWithoutDate(new Date().getTime());
    }, 1000);
  }

  ngOnChanges() {
    this.assetTabActive = this.url.match(/^\/mobileTerminal(s)?.*$/g) !== null;
  }

  ngOnDestroy() {
    window.clearInterval(this.intervalId);
  }

  getTimeToLogout() {
    return Math.ceil(this.timeToLogout / 60);
  }
}
