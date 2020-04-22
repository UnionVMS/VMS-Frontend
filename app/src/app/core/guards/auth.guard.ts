import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { reduce, last } from 'rxjs/operators';

import { Router } from '@angular/router';

import { AuthSelectors } from '../../data/auth';

@Injectable()
export class AuthGuard implements CanActivate, OnDestroy {
  private isLoggedIn = false;
  private readonly isLoggedInSubscription: Subscription;
  constructor(private readonly store: Store<any>, private readonly router: Router) {
    this.isLoggedInSubscription = this.store.select(AuthSelectors.isLoggedIn)
      .subscribe((isLoggedIn: boolean) => this.isLoggedIn = isLoggedIn);
  }

  ngOnDestroy() {
    this.isLoggedInSubscription.unsubscribe();
  }

  canActivate(): boolean|UrlTree {
    if (this.isLoggedIn) {
      return true;
    } else {
      return this.router.createUrlTree(['/unauthorized']);
    }
  }
}
