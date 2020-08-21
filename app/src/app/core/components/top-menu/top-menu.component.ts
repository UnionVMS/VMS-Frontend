import { Component, Input, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';


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

  public baseUrl = window.location.origin;
  public currentTimezone: string;
  public timezones: string[];

  ngOnInit() {
    this.timezones = moment.tz.names();
  }

  ngOnChanges() {
    this.currentTimezone = this.timezone;
  }
}
