import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { version } from '@app/../../package.json';
import { Subscription, Observable } from 'rxjs';
import { NotificationsActions, NotificationsSelectors, NotificationsInterfaces } from '@data/notifications';

@Component({
  selector: 'core-default-layout-component',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})

export class DefaultLayoutComponent implements OnInit {
  public appVersion: string = version;
  public notifications$: Observable<NotificationsInterfaces.State>;
  public dismissNotification: (type: string, index: number) => void;

  constructor(private store: Store<any>) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
  }

  mapDispatchToProps() {
    this.dismissNotification = (type: string, index: number) =>
      this.store.dispatch(NotificationsActions.dismiss({ notificationType: type, index }));
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }
}
