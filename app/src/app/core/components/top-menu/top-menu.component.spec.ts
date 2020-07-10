import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSelectModule } from '@angular/material/select';

import { TopMenuComponent } from './top-menu.component';

import { provideMockStore } from '@ngrx/store/testing';

describe('TopMenuComponent', () => {
  const initialState = { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatSelectModule
      ],
      declarations: [
        TopMenuComponent
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TopMenuComponent);
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
    component.isAdmin = true;
    fixture.detectChanges();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const links = layoutElement.querySelectorAll('.navbar a');
    expect(links[0].textContent).toBe('F-Admin');
    expect(links[1].textContent).toContain('Asset');
    expect(links[2].textContent).toContain('Fishing activity');
    expect(links[3].textContent).toContain('Realtime map');
    expect(links[4].textContent).toContain('Reports map');
    expect(links[5].textContent).toContain('My Settings');
    expect(links[6].textContent).toContain('Logout');
    expect(links[7].textContent).toBe('ADMIN');

    // check so admin link don´t show when isAdmin = false
    component.isAdmin = false;
    fixture.detectChanges();
    const layoutElementNoLongerAdmin: HTMLElement = fixture.nativeElement;
    const linksNoLongerAdmin = layoutElementNoLongerAdmin.querySelectorAll('.navbar a');
    expect(linksNoLongerAdmin[7]).toBeUndefined();
  });

});
