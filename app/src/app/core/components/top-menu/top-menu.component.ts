import { Component, Input, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { Router } from '@angular/router';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'core-top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TopMenuComponent implements OnInit, OnChanges {

  @Input() appVersion: string;
  @Input() isAdmin: boolean;
  @Input() setTimezone: (timezone: string) => void;
  @Input() timezone: string;
  @Input() fishingActivityUnlocked: boolean;
  @Input() url: string;

  public baseUrl = window.location.origin;
  public currentTimezone: string;
  public timezones: string[];
  public assetTabActive: boolean;

  ngOnInit() {
    // Remove afew timezones. GMT because moment.js inverts GMT timezones.
    // Remove ETC/ because they are duplicates.
    // Remove UCT to prevent user from picking wrong when going for UTC.
    this.timezones = moment.tz.names().filter((name: string) =>
      !name.toLowerCase().includes('gmt') &&
      !name.toLowerCase().includes('uct') &&
      !name.toLowerCase().includes('etc/')
    );
  }

  ngOnChanges() {
    this.currentTimezone = this.timezone;
    this.assetTabActive = this.url.match(/^\/mobileTerminal(s)?.*$/g) !== null;
  }
}
