import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DefaultLayoutComponent } from './default.component';

// For MDB Angular Free
import {
  NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
  InputsModule, IconsModule
} from 'angular-bootstrap-md';

describe('DefaultLayoutComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        /* MDB Imports: */
        NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
        InputsModule, IconsModule
      ],
      declarations: [ DefaultLayoutComponent ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it(`should have a navbar`, () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const navbar = layoutElement.querySelector('mdb-navbar');
    expect(navbar).not.toBeNull();
  });

  it(`should have correct links`, () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const links = layoutElement.querySelectorAll('mdb-navbar a');
    expect(links[0].textContent).toBe("VMS");
    expect(links[1].textContent).toContain("Home");
    expect(links[2].textContent).toContain("Test");
    expect(links[3].textContent).toContain("Kartan");
  });

  it('should have a continer with router-outlet in it', () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const routerOutlet = layoutElement.querySelector('.container router-outlet');
    expect(routerOutlet).not.toBeNull();
  });
});