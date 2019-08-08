import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FullLayoutComponent } from './full.component';

// Components
import { TopMenuComponent } from '../../components/top-menu/top-menu.component';

describe('FullLayoutComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        FullLayoutComponent,
        TopMenuComponent,
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(FullLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should have a router-outlet', () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const routerOutlet = layoutElement.querySelector('router-outlet');
    expect(routerOutlet).not.toBeNull();
  });
});
