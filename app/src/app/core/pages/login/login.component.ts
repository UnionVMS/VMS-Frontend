import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthReducer, AuthActions, AuthSelectors } from '../../../data/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;

  constructor(private store: Store<AuthReducer.State>, private router: Router) { }

  ngOnInit() {
    this.store.select(AuthSelectors.isLoggedIn).subscribe(isLoggedIn => {
      if(isLoggedIn) {
        this.router.navigate(['/map/realtime'])
      }
    });
  }

  submitLogin(username: string, password: string) {
    console.warn(username, password);
    this.store.dispatch(new AuthActions.Login({ username: username, password: password }));
    return false;
  }

}
