import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@app/app-reducer';
import { AuthActions } from '@data/auth/';
// import { MapSettingsActions } from '@data/map-settings/';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private store: Store<State>) {}

  ngOnInit() {
    if(typeof window.localStorage.authToken !== 'undefined') {
      const jwtToken = jwtDecode(window.localStorage.authToken);
      if(Date.now() > jwtToken.exp * 1000) {
        delete window.localStorage.authToken;
      } else {
        this.store.dispatch(new AuthActions.LoginSuccess(window.localStorage.authToken));
      }
    } else if(typeof window.localStorage['ngStorage-token'] !== 'undefined') {
      const jwtToken = jwtDecode(window.localStorage['ngStorage-token']);
      if(Date.now() > jwtToken.exp * 1000) {
        delete window.localStorage['ngStorage-token'];
      } else {
        window.localStorage.authToken = window.localStorage['ngStorage-token'].replace(/^\"+|\"+$/g, '');
        this.store.dispatch(new AuthActions.LoginSuccess(window.localStorage.authToken));
      }
    }

    // if (typeof window.localStorage.mySettings !== 'undefined') {
    //   const settings = JSON.parse(window.localStorage.mySettings);
    //   this.store.dispatch(new MapSettingsActions.ReplaceSettings(settings.mapSettings));
    // }

  }
}
