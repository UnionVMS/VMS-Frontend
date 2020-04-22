import { Component, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';
import { AuthReducer, AuthActions, AuthSelectors, AuthTypes } from '../../../data/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  username: string;
  password: string;

  constructor(private readonly store: Store<AuthTypes.State>) { }

  submitLogin(username: string, password: string) {
    this.store.dispatch(AuthActions.login({ username, password }));
    return false;
  }
}
