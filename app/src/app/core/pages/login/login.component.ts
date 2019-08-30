import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthReducer, AuthActions, AuthSelectors, AuthInterfaces } from '../../../data/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;

  constructor(private store: Store<AuthInterfaces.State>, private router: Router) { }

  ngOnInit() {
    this.store.select(AuthSelectors.isLoggedIn).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/map/realtime']);
      }
    });
  }

  submitLogin(username: string, password: string) {
    this.store.dispatch(AuthActions.login({ username, password }));
    return false;
  }

}
