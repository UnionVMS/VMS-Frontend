import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Store } from '@ngrx/store';
import { TestingModule } from '@testing/Utils';
/* Modules */
import { UIModule } from '../../../ui/ui.module';


import { RealtimeComponent } from './realtime.component';

/* Components */
import { AssetsComponent } from '../../components/assets/assets.component';
import { AssetForecastComponent } from '../../components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from '../../components/asset-panel/asset-panel.component';
import { FlagstatesComponent } from '../../components/flagstates/flagstates.component';
import { MapSettingsComponent } from '../../components/map-settings/map-settings.component';
import { MapViewportsComponent } from '../../components/map-viewports/map-viewports.component';
import { TracksComponent } from '../../components/tracks/tracks.component';
import { TrackPanelComponent } from '../../components/track-panel/track-panel.component';

import { AuthActions } from '@data/auth';


describe('RealtimeComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        UIModule,
      ],
      declarations: [
        RealtimeComponent,
        AssetsComponent,
        AssetForecastComponent,
        AssetPanelComponent,
        FlagstatesComponent,
        MapSettingsComponent,
        MapViewportsComponent,
        TracksComponent,
        TrackPanelComponent
      ],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    })
    .compileComponents();
  }));


  function setup() {
    const fixture = TestBed.createComponent(RealtimeComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
  //
  // it('should dispatch AuthActions.Login on submit and redirect', () => {
  //   const { fixture, component } = setup();
  //   const store = TestBed.get(Store);
  //   const dispatchSpy = spyOn(store, 'dispatch');
  //
  //   const usernameElement = fixture.debugElement.query(By.css('input#loginFormUsername'));
  //   const passwordElement = fixture.debugElement.query(By.css('input#loginFormPassword'));
  //   const submitElement = fixture.debugElement.query(By.css('button'));
  //
  //   const username = "Username123";
  //   const password = "Password123";
  //
  //   usernameElement.nativeElement.value = username;
  //   passwordElement.nativeElement.value = password;
  //
  //   expect(dispatchSpy).toHaveBeenCalledTimes(0);
  //
  //   submitElement.triggerEventHandler('click', null);
  //
  //   expect(dispatchSpy).toHaveBeenCalledTimes(1);
  //   expect(dispatchSpy).toHaveBeenCalledWith(
  //     new AuthActions.Login({ username, password })
  //   );
  // });
  //
  // it('should redirect from login component on succesfull login.', () => {
  //   const { component } = setup();
  //   const router = TestBed.get(Router);
  //   const store = TestBed.get(Store);
  //   const navigateSpy = spyOn(router, 'navigate');
  //
  //   store.setState({ auth: { user: null } });
  //   component.ngOnInit();
  //   store.setState({ auth: { user: { data: { username: 'Username123' } } } });
  //   expect(navigateSpy).toHaveBeenCalledWith(['/map/realtime']);
  // });

});
