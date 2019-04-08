import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

// import { StoreModule } from '@ngrx/store';
// import { reducers, metaReducers } from '../../../app-reducer';
import { Store } from '@ngrx/store';
import { TestStore } from '@testing/TestStore';

import { LoginComponent } from './login.component';

import { AuthActions } from '../../../data/auth';

// For MDB Angular Free
import {
  NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
  InputsModule, IconsModule
} from 'angular-bootstrap-md';


describe('LoginComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        RouterTestingModule,
        // StoreModule.forRoot(reducers, { metaReducers }),
        /* MDB Imports: */
        NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
        InputsModule, IconsModule
      ],
      providers: [
        { provide: Store, useClass: TestStore }   // use test store instead of ngrx store
      ]
    })
    .compileComponents();
  }));

  // beforeEach(inject([Store], (testStore: TestStore<TodosState>) => {
  //   store = testStore;                            // save store reference for use in tests
  //   store.setState({ }); // set default state
  // }));

  function setup() {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should dispatch AuthActions.Login on submit', () => {
    const { fixture, component } = setup();
    const store = TestBed.get(Store);
    // console.warn(component.store);
    const dispatchSpy = spyOn(store, 'dispatch');

    const usernameElement = fixture.debugElement.query(By.css('input#loginFormUsername'));
    const passwordElement = fixture.debugElement.query(By.css('input#loginFormPassword'));
    const submitElement = fixture.debugElement.query(By.css('button'));
    // AuthActions.Login

    const username = "Username123";
    const password = "Password123";

    usernameElement.nativeElement.value = username;
    passwordElement.nativeElement.value = password;

    submitElement.triggerEventHandler('click', null);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      new AuthActions.Login({ username, password })
    );

    // expect()
    // expect(component).toBeTruthy();
  });

});
