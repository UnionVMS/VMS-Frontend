import { Component, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';
import { AuthReducer, AuthActions, AuthSelectors, AuthInterfaces } from '../../../data/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  username: string;
  password: string;

  constructor(private store: Store<AuthInterfaces.State>) { }

  submitLogin(username: string, password: string) {
    this.store.dispatch(AuthActions.login({ username, password }));
    return false;
  }
}
