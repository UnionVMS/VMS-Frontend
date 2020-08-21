import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable, Subject } from 'rxjs';
import { reduce, last, takeUntil } from 'rxjs/operators';

import { Router } from '@angular/router';

import { AuthSelectors } from '../../data/auth';

@Injectable()
export class FishingGuard implements CanActivate, OnDestroy {
  private fishingActivityUnlocked = false;
  private readonly unmount$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly store: Store<any>, private readonly router: Router) {
    this.store.select(AuthSelectors.fishingActivityUnlocked).pipe(takeUntil(this.unmount$))
      .subscribe((fishingActivityUnlocked: boolean) => this.fishingActivityUnlocked = fishingActivityUnlocked);
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  canActivate(): boolean|UrlTree {
    if (this.fishingActivityUnlocked) {
      return true;
    } else {
      return this.router.createUrlTree(['/404']);
    }
  }
}
