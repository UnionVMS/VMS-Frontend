import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';

import RouterStub from '@data/router/stubs/router.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import UserStub from '@data/auth/stubs/user.stub';
import { initialState as AssetInitialState } from '@data/asset/asset.reducer';
import { initialState as NotificationInitialState } from '@data/notifications/notifications.reducer';
import { initialState as UserSettingsInitialState } from '@data/user-settings/user-settings.reducer';


import { EfrDefaultLayoutComponent } from './efr-default.component';


// Components
import { LogoutTimerComponent } from '@app/core/components/logout-timer/logout-timer.component';
import { EfrTopMenuComponent } from '@app/core/components/efr-top-menu/efr-top-menu.component';
import { NotificationsComponent } from '@app/core/components/notifications/notifications.component';

describe('AssetLayoutComponent', () => {

  const initialState = {
    asset: { ...AssetInitialState, assets: { [AssetStub.id]: AssetStub } },
    router: RouterStub,
    notifications: NotificationInitialState,
    auth: { user: UserStub },
    userSettings: UserSettingsInitialState
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [
            { path: 'fishing-report/:fishingReportId', children: [], pathMatch: 'full' },
          ]
        ),
        MatSelectModule
      ],
      declarations: [
        EfrDefaultLayoutComponent,
        LogoutTimerComponent,
        EfrTopMenuComponent,
        NotificationsComponent,
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(EfrDefaultLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have a efr-default-layout--grid with router-outlet in it', () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const routerOutlet = layoutElement.querySelector('.efr-default-layout--grid router-outlet');
    expect(routerOutlet).not.toBeNull();
  });

});
