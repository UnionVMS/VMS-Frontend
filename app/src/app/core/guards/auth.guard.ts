import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable, Subject } from 'rxjs';
import { reduce, last, takeUntil } from 'rxjs/operators';

import { Router } from '@angular/router';

import { AuthSelectors } from '@data/auth';
import { RouterSelectors } from '@data/router';


@Injectable()
export class AuthGuard implements CanActivate, OnDestroy {
  private isLoggedIn = false;
  private currentUrl: string;
  private unmount$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly store: Store<any>, private readonly router: Router) {
    this.store.select(RouterSelectors.getMergedRoute).pipe(takeUntil(this.unmount$)).subscribe(mergedRoute => {
      this.currentUrl = mergedRoute.url;
    });
    this.store.select(AuthSelectors.isLoggedIn).pipe(takeUntil(this.unmount$))
      .subscribe((isLoggedIn: boolean) => this.isLoggedIn = isLoggedIn);
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  canActivate(): boolean|UrlTree {
    if (this.isLoggedIn) {
      return true;
    } else if(this.currentUrl === '/') {
      return this.router.createUrlTree(['/login']);
    } else {
      return this.router.createUrlTree(['/unauthorized']);
    }
  }
}
