import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { version } from '@app/../../package.json';
import { Subscription, Observable } from 'rxjs';
import { NotificationsActions, NotificationsSelectors, NotificationsTypes } from '@data/notifications';
import { UserSettingsActions, UserSettingsSelectors, UserSettingsTypes } from '@data/user-settings';
import { AuthSelectors } from '@data/auth';

@Component({
  selector: 'core-default-layout-component',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})

export class DefaultLayoutComponent implements OnInit {
  public appVersion: string = version;

  public isAdmin$: Observable<boolean>;
  public timezone$: Observable<string>;
  public notifications$: Observable<NotificationsTypes.State>;

  public dismissNotification: (type: string, index: number) => void;
  public setTimezone: (timezone: string) => void;

  constructor(private readonly store: Store<any>) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
    this.timezone$ = this.store.select(UserSettingsSelectors.getTimezone);
    this.isAdmin$ = this.store.select(AuthSelectors.isAdmin);
  }

  mapDispatchToProps() {
    this.dismissNotification = (type: string, index: number) =>
      this.store.dispatch(NotificationsActions.dismiss({ notificationType: type, index }));
    this.setTimezone = (timezone: string) =>
      this.store.dispatch(UserSettingsActions.setTimezone({ timezone, save: true }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }
}
