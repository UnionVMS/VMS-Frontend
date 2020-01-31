import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { version } from '@app/../../package.json';
import { Subscription, Observable } from 'rxjs';
import { NotificationsActions, NotificationsSelectors, NotificationsInterfaces } from '@data/notifications';
import { AuthSelectors } from '@data/auth';

@Component({
  selector: 'core-full-layout-component',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})

export class FullLayoutComponent implements OnInit {
  public appVersion: string = version;
  public notifications$: Observable<NotificationsInterfaces.State>;
  public dismissNotification: (type: string, index: number) => void;
  public isAdmin: boolean;

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
    this.store.select(AuthSelectors.isAdmin).subscribe((isAdmin: boolean) => this.isAdmin = isAdmin);
  }
}
