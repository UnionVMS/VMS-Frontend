import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Store } from '@ngrx/store';
import { TestingModule } from '@src/testing/Utils';
import { MatFormFieldModule } from '@angular/material/form-field';

import { LoginComponent } from './login.component';

import { AuthActions } from '../../../data/auth';

describe('LoginComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        TestingModule,
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
      AuthActions.login({ username, password })
    );
  });

});
