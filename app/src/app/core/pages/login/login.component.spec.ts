import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Store } from '@ngrx/store';
import { TestingModule } from '@testing/Utils';
import { MatFormFieldModule } from '@angular/material/form-field';

import { LoginComponent } from './login.component';

import { AuthActions } from '../../../data/auth';

// For MDB Angular Free
import { CheckboxModule } from 'angular-bootstrap-md';

describe('LoginComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        TestingModule,
        CheckboxModule,
        MatFormFieldModule,
      ],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    })
    .compileComponents();
  }));


  function setup() {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should dispatch AuthActions.Login on submit and redirect', () => {
    const { fixture, component } = setup();
    const store = TestBed.get(Store);
    const dispatchSpy = spyOn(store, 'dispatch');

    const usernameElement = fixture.debugElement.query(By.css('input#loginFormUsername'));
    const passwordElement = fixture.debugElement.query(By.css('input#loginFormPassword'));
    const submitElement = fixture.debugElement.query(By.css('button'));

    const username = 'Username123';
    const password = 'Password123';

    usernameElement.nativeElement.value = username;
    passwordElement.nativeElement.value = password;

    expect(dispatchSpy).toHaveBeenCalledTimes(0);

    submitElement.triggerEventHandler('click', null);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      new AuthActions.Login({ username, password })
    );
  });

  it('should redirect from login component on succesfull login.', () => {
    const { component } = setup();
    const router = TestBed.get(Router);
    const store = TestBed.get(Store);
    const navigateSpy = spyOn(router, 'navigate');

    store.setState({ auth: { user: null } });
    component.ngOnInit();
    store.setState({ auth: { user: { data: { username: 'Username123' } } } });
    expect(navigateSpy).toHaveBeenCalledWith(['/map/realtime']);
  });

});
