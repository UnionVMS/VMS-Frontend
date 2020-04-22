import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { DefaultLayoutComponent } from './default.component';

// Components
import { TopMenuComponent } from '../../components/top-menu/top-menu.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';

describe('DefaultLayoutComponent', () => {

  // let store: MockStore<{ }>;
  const initialState = { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        DefaultLayoutComponent,
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
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have a continer with router-outlet in it', () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const routerOutlet = layoutElement.querySelector('.container router-outlet');
    expect(routerOutlet).not.toBeNull();
  });
});
