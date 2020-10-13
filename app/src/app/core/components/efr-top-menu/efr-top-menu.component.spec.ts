import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSelectModule } from '@angular/material/select';

import { EfrTopMenuComponent } from './efr-top-menu.component';

import { provideMockStore } from '@ngrx/store/testing';

describe('TopMenuComponent', () => {
  const initialState = { };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatSelectModule
      ],
      declarations: [
        EfrTopMenuComponent
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(EfrTopMenuComponent);
    const component = fixture.componentInstance;
    return { fixture , component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it(`should have a navbar`, () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const navbar = layoutElement.querySelector('.navbar');

    expect(navbar).not.toBeNull();
  });

  it(`should have correct links`, () => {
    const { fixture, component} = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const links = layoutElement.querySelectorAll('.navbar a');
    expect(links[0].textContent).toContain('Electronic catch reporting - EFR Support tool');
    expect(links[1].textContent).toContain('Logout');
  });

});
