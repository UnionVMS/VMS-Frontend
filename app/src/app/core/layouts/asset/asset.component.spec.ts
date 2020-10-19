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


import { AssetLayoutComponent } from './asset.component';


// Components
import { LogoutTimerComponent } from '../../components/logout-timer/logout-timer.component';
import { TopMenuComponent } from '../../components/top-menu/top-menu.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';

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
            { path: 'asset/:assetId', children: [], pathMatch: 'full' },
            { path: 'asset/:assetId/mobileTerminals', children: [], pathMatch: 'full' },
            { path: 'asset/:assetId/contacts', children: [], pathMatch: 'full' },
            { path: 'asset/:assetId/notes', children: [], pathMatch: 'full' },
            { path: 'asset/:assetId/positions', children: [], pathMatch: 'full' }
          ]
        ),
        MatSelectModule
      ],
      declarations: [
        AssetLayoutComponent,
        LogoutTimerComponent,
        TopMenuComponent,
        NotificationsComponent,
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(AssetLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have a asset-layout--grid with router-outlet in it', () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const routerOutlet = layoutElement.querySelector('.asset-layout--grid router-outlet');
    expect(routerOutlet).not.toBeNull();
  });

  it('should navigate when key is pressed', () => {
    const { fixture, component } = setup();
    // tslint:disable-next-line:no-string-literal
    const navigateSpy = spyOn(component['router'], 'navigate');

    let expectedTimesCalled = 0;

    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    component.keyEvent({ altKey: true, key: 'a' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset']);

    component.keyEvent({ altKey: false, key: 'a' } as KeyboardEvent);
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);

    const store = TestBed.inject(MockStore);
    let currentState = { ...initialState,
      asset: AssetInitialState
    };
    store.setState(currentState);
    fixture.detectChanges();
    component.keyEvent({ altKey: true, key: '1' } as KeyboardEvent);
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);

    currentState = { ...initialState,
      asset: { ...AssetInitialState, assets: { [AssetStub.id]: AssetStub } }
    };
    store.setState(currentState);
    fixture.detectChanges();
    component.keyEvent({ altKey: true, key: '1' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset/ba498d76-ecd1-486a-9302-728367b237a7']);

    component.keyEvent({ altKey: true, key: '2' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/mobileTerminals']);

    component.keyEvent({ altKey: true, key: '3' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/contacts']);

    component.keyEvent({ altKey: true, key: '4' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/notes']);

    component.keyEvent({ altKey: true, key: '5' } as KeyboardEvent);
    expectedTimesCalled++;
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
    expect(navigateSpy).toHaveBeenCalledWith(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/positions']);

    component.keyEvent({ altKey: true, key: 'blubb' } as KeyboardEvent);
    expect(navigateSpy).toHaveBeenCalledTimes(expectedTimesCalled);
  });

  it('should show the correct link as active when navigating', fakeAsync(() => {
    const { fixture, component } = setup();

    const ngZone = TestBed.inject(NgZone);
    const store = TestBed.inject(MockStore);
    let currentState = initialState;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.matchAssetInfoUrl()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.asset-layout--grid .side-menu .active .text').textContent).toBe('Asset info');


    currentState = { ...currentState,
      router: {
        state: {
          url: '/asset/ba498d76-ecd1-486a-9302-728367b237a7/mobileTerminals',
          params: {
            assetId: 'ba498d76-ecd1-486a-9302-728367b237a7'
          },
          queryParams: {},
          data: {
            title: '<dont-translate>assetName</dont-translate> — Mobile Terminals'
          }
        },
        navigationId: 2
      }
    };
    store.setState(currentState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.asset-layout--grid .side-menu .active .text').textContent).toBe('Mobile terminal');


    const router = TestBed.inject(Router);
    ngZone.run(() => router.navigate(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/contacts']));
    tick();
    currentState = { ...currentState,
      router: {
        state: {
          url: '/asset/ba498d76-ecd1-486a-9302-728367b237a7/contacts',
          params: {
            assetId: 'ba498d76-ecd1-486a-9302-728367b237a7'
          },
          queryParams: {},
          data: {
            title: '<dont-translate>assetName</dont-translate> — Contacts'
          }
        },
        navigationId: 3
      }
    };
    store.setState(currentState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.asset-layout--grid .side-menu .active .text').textContent).toBe('Contacts');


    ngZone.run(() => router.navigate(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/notes']));
    tick();
    currentState = { ...currentState,
      router: {
        state: {
          url: '/asset/ba498d76-ecd1-486a-9302-728367b237a7/notes',
          params: {
            assetId: 'ba498d76-ecd1-486a-9302-728367b237a7'
          },
          queryParams: {},
          data: {
            title: '<dont-translate>assetName</dont-translate> — Notes'
          }
        },
        navigationId: 4
      }
    };
    store.setState(currentState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.asset-layout--grid .side-menu .active .text').textContent).toBe('Notes');


    ngZone.run(() => router.navigate(['/asset/ba498d76-ecd1-486a-9302-728367b237a7/positions']));
    tick();
    currentState = { ...currentState,
      router: {
        state: {
          url: '/asset/ba498d76-ecd1-486a-9302-728367b237a7/positions',
          params: {
            assetId: 'ba498d76-ecd1-486a-9302-728367b237a7'
          },
          queryParams: {},
          data: {
            title: '<dont-translate>assetName</dont-translate> — Last positions'
          }
        },
        navigationId: 4
      }
    };
    store.setState(currentState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.asset-layout--grid .side-menu .active .text').textContent).toBe('Last positions');
  }));
});
