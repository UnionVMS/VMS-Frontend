import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { AssetLayoutComponent } from './asset.component';

// Components
import { TopMenuComponent } from '../../components/top-menu/top-menu.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';

describe('AssetLayoutComponent', () => {

  // let store: MockStore<{ }>;
  const initialState = { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        AssetLayoutComponent,
        TopMenuComponent,
        NotificationsComponent,
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(AssetLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  }

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
});
