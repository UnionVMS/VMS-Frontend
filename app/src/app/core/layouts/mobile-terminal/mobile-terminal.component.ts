import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
// import { version as appVersion } from '@app/../../package.json';
import * as packageJsonInfo from '@app/../../package.json';
import { Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { takeUntil, skipWhile, take } from 'rxjs/operators';
import { AuthSelectors } from '@data/auth';
import { NotificationsActions, NotificationsSelectors, NotificationsTypes } from '@data/notifications';
import { UserSettingsActions, UserSettingsSelectors, UserSettingsTypes } from '@data/user-settings';
import { MobileTerminalSelectors, MobileTerminalTypes } from '@data/mobile-terminal';

import { replacePlaceholdersInTranslation } from '@app/helpers/helpers';

import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'core-mobile-terminal-layout-component',
  templateUrl: './mobile-terminal.component.html',
  styleUrls: ['./mobile-terminal.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MobileTerminalLayoutComponent implements OnInit, OnDestroy {
  public appVersion: string = packageJsonInfo.version;

  public isAdmin$: Observable<boolean>;
  public fishingActivityUnlocked$: Observable<boolean>;
  public timezone$: Observable<string>;
  public notifications$: Observable<NotificationsTypes.State>;
  public timeToLogout$: Observable<number|null>;

  public dismissNotification: (type: string, id: string) => void;
  public setTimezone: (timezone: string) => void;

  private readonly unmount$: Subject<boolean> = new Subject<boolean>();
  public mergedRoute: RouterTypes.MergedRoute;
  public pageTitle: string;
  public selectedMobileTerminal: MobileTerminalTypes.MobileTerminal;

  constructor(private readonly store: Store<any>, private readonly router: Router) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
    this.store.select(RouterSelectors.getMergedRoute).pipe(takeUntil(this.unmount$)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      this.pageTitle = mergedRoute.data.title;
    });
    this.store.select(MobileTerminalSelectors.getMobileTerminalByUrl)
      .pipe(
        takeUntil(this.unmount$),
        skipWhile(mobileTerminal => typeof mobileTerminal === 'undefined')
      ).subscribe((mobileTerminal) => {
        this.selectedMobileTerminal = mobileTerminal;
      });
    this.timezone$ = this.store.select(UserSettingsSelectors.getTimezone);
    this.isAdmin$ = this.store.select(AuthSelectors.isAdmin);
    this.fishingActivityUnlocked$ = this.store.select(AuthSelectors.fishingActivityUnlocked);
    this.timeToLogout$ = this.store.select(AuthSelectors.getTimeToLogout);
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

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.altKey) {
      if(event.key === 'a') {
        this.router.navigate(['/asset']);
      } else if(event.key === 'm') {
        this.router.navigate(['/mobileTerminals']);
      } else if(this.selectedMobileTerminal) {
        switch (event.key) {
          case '1':
            this.router.navigate(['/mobileTerminal/' + this.selectedMobileTerminal.id ]);
            break;
          case '2':
            this.router.navigate(['/mobileTerminal/' + this.selectedMobileTerminal.id + '/edit']);
            break;
          case '3':
            this.router.navigate(['/mobileTerminal/' + this.selectedMobileTerminal.id + '/attachment-history']);
            break;
          case '4':
            this.router.navigate(['/mobileTerminal/' + this.selectedMobileTerminal.id + '/history']);
            break;
          default:
            break;
        }
      }
    }
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  getTitleName() {
    return replacePlaceholdersInTranslation(this.pageTitle, {
      mobileTerminalName: typeof this.selectedMobileTerminal !== 'undefined' ? this.selectedMobileTerminal.serialNo : 'Mobile Terminal'
    });
  }

}
