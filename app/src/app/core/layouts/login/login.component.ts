import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import packageJson from '@app/../../package.json';
import { Subscription, Observable } from 'rxjs';
import { NotificationsActions, NotificationsSelectors, NotificationsTypes } from '@data/notifications';

@Component({
  selector: 'core-login-layout-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginLayoutComponent implements OnInit {
  public appVersion: string = packageJson.version;
  public notifications$: Observable<NotificationsTypes.State>;
  public dismissNotification: (type: string, id: string) => void;

  constructor(private readonly store: Store<any>) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
  }

  mapDispatchToProps() {
    this.dismissNotification = (type: string, id: string) =>
      this.store.dispatch(NotificationsActions.dismiss({ notificationType: type, id }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }
}
