import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { version } from '@app/../../package.json';
import { Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from '@data/auth';
import { NotificationsActions, NotificationsSelectors, NotificationsTypes } from '@data/notifications';
import { UserSettingsActions, UserSettingsSelectors, UserSettingsTypes } from '@data/user-settings';
import { FishingReportSelectors, FishingReportTypes } from '@data/fishing-report';
import { replaceDontTranslate } from '@app/helpers/helpers';

import { RouterTypes, RouterSelectors } from '@data/router';

@Component({
  selector: 'core-efr-default-layout-component',
  templateUrl: './efr-default.component.html',
  styleUrls: ['./efr-default.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EfrDefaultLayoutComponent implements OnInit, OnDestroy {
  public appVersion: string = version;

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
  public selectedFishingReport: FishingReportTypes.FishingReport;

  constructor(private readonly store: Store<any>, private readonly router: Router) { }

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
    this.store.select(RouterSelectors.getMergedRoute).pipe(takeUntil(this.unmount$)).subscribe(mergedRoute => {
      this.mergedRoute = mergedRoute;
      this.pageTitle = mergedRoute.data.title;
    });
    this.store.select(FishingReportSelectors.getFishingReportByUrl).pipe(takeUntil(this.unmount$)).subscribe(
      (fishingReport: FishingReportTypes.FishingReport) => {
        if(typeof fishingReport !== 'undefined') {
          this.selectedFishingReport = fishingReport;
        }
      }
    );
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

  // @HostListener('window:keyup', ['$event'])
  // keyEvent(event: KeyboardEvent) {
  //   if(event.altKey) {
  //     if(event.key === 's') {
  //       this.router.navigate(['/asset']);
  //     } else if(event.key === 'm') {
  //       this.router.navigate(['/mobileTerminals']);
  //     } else if(this.selectedAsset) {
  //       switch (event.key) {
  //         case '1':
  //           this.router.navigate(['/asset/' + this.selectedAsset.id ]);
  //           break;
  //         case '2':
  //           this.router.navigate(['/asset/' + this.selectedAsset.id + '/mobileTerminals']);
  //           break;
  //         case '3':
  //           this.router.navigate(['/asset/' + this.selectedAsset.id + '/contacts']);
  //           break;
  //         case '4':
  //           this.router.navigate(['/asset/' + this.selectedAsset.id + '/notes']);
  //           break;
  //         case '5':
  //           this.router.navigate(['/asset/' + this.selectedAsset.id + '/positions']);
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   }
  // }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  getTitleName() {
    return replaceDontTranslate(this.pageTitle, {
      fishingReportCfr: typeof this.selectedFishingReport !== 'undefined' ? this.selectedFishingReport.shipCfr : 'Fishing report'
    });
  }

  matchFishingReportInfoUrl() {
    return this.mergedRoute.url.match(/^\/fishing-report\/([^/]+)$/g) !== null;
  }


}
