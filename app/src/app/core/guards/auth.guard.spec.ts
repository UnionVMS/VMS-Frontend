import { waitForAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { AuthGuard } from './auth.guard';

import { AuthActions } from '@data/auth';

describe('AuthGuard', () => {

  const mockRouter = {
    createUrlTree: () => {}
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        provideMockStore(),
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const store = TestBed.inject(MockStore);
    const router = TestBed.inject(Router);
    store.setState({ auth: { user: null } });
    const authGuard = new AuthGuard(store, router);
    return { store, router, authGuard };
  };

  it('should redirect if not logged in.', () => {
    const { store, router, authGuard } = setup();
    const createUrlTreeSpy = spyOn(router, 'createUrlTree');

    expect(createUrlTreeSpy).toHaveBeenCalledTimes(0);
    expect(authGuard.canActivate()).not.toBeDefined();
    expect(createUrlTreeSpy).toHaveBeenCalledTimes(1);
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/unauthorized']);

    store.setState({ auth: { user: { data: { username: 'Username123' } } } });
    expect(authGuard.canActivate()).toBeTruthy();
    expect(createUrlTreeSpy).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on destory', () => {
    const { store, router, authGuard } = setup();
    const createUrlTreeSpy = spyOn(router, 'createUrlTree');

    expect(createUrlTreeSpy).toHaveBeenCalledTimes(0);
    expect(authGuard.canActivate()).not.toBeDefined();
    expect(createUrlTreeSpy).toHaveBeenCalledTimes(1);
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/unauthorized']);

    authGuard.ngOnDestroy();

    store.setState({ auth: { user: { data: { username: 'Username123' } } } });
    expect(authGuard.canActivate()).not.toBeDefined();
    expect(createUrlTreeSpy).toHaveBeenCalledTimes(2);
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/unauthorized']);
  });


});
