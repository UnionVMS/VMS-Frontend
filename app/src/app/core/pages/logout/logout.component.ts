import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions, AuthSelectors } from '@data/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'core-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  public isLoggedIn$: Observable<any>;
  constructor(
    private readonly store: Store<any>,
    private readonly router: Router
  ) { }


  ngOnInit() {
    this.store.dispatch(AuthActions.logout());
    this.isLoggedIn$ = this.store.select(AuthSelectors.isLoggedIn);
  }

  redirectFactory() {
    return () => this.router.navigate(['/login']);
  }
}
