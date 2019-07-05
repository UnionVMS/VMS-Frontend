import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthReducer, AuthActions, AuthSelectors } from '../../../data/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;

  constructor(private store: Store<AuthReducer.State>, private router: Router) { }

  ngOnInit() {
    this.store.select(AuthSelectors.isLoggedIn).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/map/realtime']);
      }
    });
  }

  submitLogin(username: string, password: string) {
    this.store.dispatch(new AuthActions.Login({ username, password }));
    return false;
  }

}
