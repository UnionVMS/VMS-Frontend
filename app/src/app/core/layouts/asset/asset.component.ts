import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { version } from '@app/../../package.json';
import { Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthSelectors } from '@data/auth';
import { NotificationsActions, NotificationsSelectors, NotificationsInterfaces } from '@data/notifications';
import { UserSettingsActions, UserSettingsSelectors, UserSettingsInterfaces } from '@data/user-settings';
import { AssetSelectors, AssetInterfaces } from '@data/asset';
import { replaceDontTranslate } from '@app/helpers/helpers';

import { RouterInterfaces, RouterSelectors } from '@data/router';

@Component({
  selector: 'core-asset-layout-component',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AssetLayoutComponent implements OnInit, OnDestroy {
  public appVersion: string = version;

  public isAdmin$: Observable<boolean>;
  public timezone$: Observable<string>;
  public notifications$: Observable<NotificationsInterfaces.State>;

  public dismissNotification: (type: string, index: number) => void;
  public setTimezone: (timezone: string) => void;

  private unmount$: Subject<boolean> = new Subject<boolean>();
  public mergedRoute: RouterInterfaces.MergedRoute;
  public pageTitle: string;
  public selectedAsset: AssetInterfaces.Asset;

  constructor(private store: Store<any>, private router: Router) { }

  // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Crisis> | Observable<never> {
  //   let id = route.paramMap.get('id');
  //
  //   return this.cs.getCrisis(id).pipe(
  //     take(1),
  //     mergeMap(crisis => {
  //       if (crisis) {
  //         return of(crisis);
  //       } else { // id not found
  //         this.router.navigate(['/crisis-center']);
  //         return EMPTY;
  //       }
  //     })
  //   );

  mapStateToProps() {
    this.notifications$ = this.store.select(NotificationsSelectors.getNotifications);
    this.store.select(RouterSelectors.getMergedRoute).pipe(takeUntil(this.unmount$)).subscribe(mergedRoute => {
      // console.warn(mergedRoute);
      this.mergedRoute = mergedRoute;
      this.pageTitle = mergedRoute.data.title;
    });
    this.store.select(AssetSelectors.getSelectedAsset).pipe(takeUntil(this.unmount$)).subscribe((asset: AssetInterfaces.Asset) => {
      if(typeof asset !== 'undefined') {
        this.selectedAsset = asset;
      }
    });
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

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.altKey) {
      if(event.key === 's') {
        this.router.navigate(['/asset']);
      } else if(this.selectedAsset) {
        switch (event.key) {
          case '1':
            this.router.navigate(['/asset/' + this.selectedAsset.id ]);
            break;
          case '2':
            this.router.navigate(['/asset/' + this.selectedAsset.id + '/mobileTerminals']);
            break;
          case '3':
            this.router.navigate(['/asset/' + this.selectedAsset.id + '/contacts']);
            break;
          case '4':
            this.router.navigate(['/asset/' + this.selectedAsset.id + '/notes']);
            break;
          case '5':
            this.router.navigate(['/asset/' + this.selectedAsset.id + '/positions']);
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
    return replaceDontTranslate(this.pageTitle, {
      assetName: typeof this.selectedAsset !== 'undefined' ? this.selectedAsset.name : 'Assets'
    });
  }

  matchMobileTerminalUrl() {
    return this.mergedRoute.url.match(/^\/asset\/.*\/mobileTerminal\/.*\/edit$/g) !== null ||
      this.mergedRoute.url.match(/^\/asset\/.*\/mobileTerminal\/attach$/g) !== null ||
      this.mergedRoute.url.match(/^\/asset\/.*\/mobileTerminals$/g) !== null ||
      this.mergedRoute.url.match(/^\/mobileTerminal\/.*\/create$/g) !== null;
  }

}
