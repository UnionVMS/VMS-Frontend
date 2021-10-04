import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import packageJson from '@app/../../package.json'; 
import { Observable } from 'rxjs';
import { NotificationsActions, NotificationsSelectors, NotificationsTypes } from '@data/notifications';
import { UserSettingsActions, UserSettingsSelectors, UserSettingsTypes } from '@data/user-settings';
import { AuthSelectors } from '@data/auth';
import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'core-full-layout-component',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})

export class FullLayoutComponent implements OnInit {
  public appVersion: string = packageJson.version;

  public notifications$: Observable<NotificationsTypes.State>;
  public isAdmin$: Observable<boolean>;
  public fishingActivityUnlocked$: Observable<boolean>;
  public timezone$: Observable<string>;
  public mergedRoute$: Observable<RouterTypes.MergedRoute>;
  public timeToLogout$: Observable<number|null>;
  public userName$: Observable<string>;

  public setTimezone: (timezone: string) => void;
  public dismissNotification: (type: string, id: string) => void;

  constructor(private readonly store: Store<any>) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
    this.timezone$ = this.store.select(UserSettingsSelectors.getTimezone);
    this.isAdmin$ = this.store.select(AuthSelectors.isAdmin);
    this.fishingActivityUnlocked$ = this.store.select(AuthSelectors.fishingActivityUnlocked);
    this.mergedRoute$ = this.store.select(RouterSelectors.getMergedRoute);
    this.timeToLogout$ = this.store.select(AuthSelectors.getTimeToLogout);
    this.userName$ = this.store.select(AuthSelectors.getUserName);
  }

  mapDispatchToProps() {
    this.dismissNotification = (type: string, id: string) =>
      this.store.dispatch(NotificationsActions.dismiss({ notificationType: type, id }));
    this.setTimezone = (timezone: string) =>
      this.store.dispatch(UserSettingsActions.setTimezone({ timezone, save: true }));
  }
  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }
}
