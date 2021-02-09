import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AuthActions, AuthSelectors } from '@data/auth/';
import jwtDecode from 'jwt-decode';

import { LoggedOutDialogComponent } from '@app/core/components/logged-out-dialog/logged-out-dialog.component';

import {Title} from "@angular/platform-browser";
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public unmount$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly store: Store<State>, public dialog: MatDialog, private readonly router: Router, private readonly titleService: Title) {}
  
  mapStateToProps() {
    this.store.select(AuthSelectors.getLoggedOutPopupActive).pipe(takeUntil(this.unmount$)).subscribe((loggedOutPopupActive) => {
      if(loggedOutPopupActive) {
        const dialogRef = this.dialog.open(LoggedOutDialogComponent, {
          disableClose: true,
          backdropClass: 'blurry-backdrop'
        });
      }
    });
  }

  ngOnInit() {
    if(typeof window.localStorage.authToken !== 'undefined') {
      const jwtToken = jwtDecode(window.localStorage.authToken);
      if(Date.now() > jwtToken.exp * 1000) {
        delete window.localStorage.authToken;
      } else {
        this.store.dispatch(AuthActions.loginSuccess({ jwtToken: window.localStorage.authToken }));
        this.openUpFishingActivityIfApplicable();
      }
    } else if(typeof window.localStorage['ngStorage-token'] !== 'undefined') {
      const jwtToken = jwtDecode(window.localStorage['ngStorage-token']);
      if(Date.now() > jwtToken.exp * 1000) {
        delete window.localStorage['ngStorage-token'];
      } else {
        window.localStorage.authToken = window.localStorage['ngStorage-token'].replace(/^\"+|\"+$/g, '');
        this.store.dispatch(AuthActions.loginSuccess({ jwtToken: window.localStorage.authToken }));
        this.openUpFishingActivityIfApplicable();
      }
    }

    // Listen to Routing event to set the title based on where you are in the app
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.titleService.setTitle(this.getNestedRouteTitles().join(' | '));
    });
      
    this.mapStateToProps();
  }

  openUpFishingActivityIfApplicable() {
    if(window.localStorage.fishingActivityUnlocked === 'true') {
      this.store.dispatch(AuthActions.unlockFishingActivity());
    }
  }

  getNestedRouteTitles(): string[] {
    let currentRoute = this.router.routerState.root.firstChild;
    const titles: string[] = [];
    while (currentRoute) {
      if (currentRoute.snapshot.routeConfig.data?.title) {
        let titleData: string[] = currentRoute.snapshot.routeConfig.data.title.split("—");
        if(currentRoute.snapshot.routeConfig.data.title)
          // Make exception for childTitles 
          if(titleData.length > 1 && !titleData[0].includes('Mobile Terminal')){
            titles.push(titleData[titleData.length -1]);
          }else{
            titles.push(currentRoute.snapshot.routeConfig.data.title);
          }
      }
      currentRoute = currentRoute.firstChild;
    }
    return titles;
  }

  getLastRouteTitle(): string {
    let currentRoute = this.router.routerState.root.firstChild;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute.snapshot.data?.title;
  }

}
