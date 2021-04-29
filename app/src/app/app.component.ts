import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthActions, AuthSelectors } from '@data/auth/';
import jwtDecode from 'jwt-decode';

import { LoggedOutDialogComponent } from '@app/core/components/logged-out-dialog/logged-out-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public unmount$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly store: Store<State>, public dialog: MatDialog) {}

  mapStateToProps() {
    this.store.select(AuthSelectors.getLoggedOutPopupActive).pipe(takeUntil(this.unmount$)).subscribe((loggedOutPopupActive) => {
      if(loggedOutPopupActive) {
        this.dialog.open(LoggedOutDialogComponent, {
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

    this.mapStateToProps();
  }

  openUpFishingActivityIfApplicable() {
    if(window.localStorage.fishingActivityUnlocked === 'true') {
      this.store.dispatch(AuthActions.unlockFishingActivity());
    }
  }
}
