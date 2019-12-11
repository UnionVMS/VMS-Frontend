import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TopMenuComponent } from './top-menu.component';

import { provideMockStore, MockStore } from '@ngrx/store/testing';

describe('TopMenuComponent', () => {
// let store: MockStore<{ }>;
const initialState = { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
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

  function setup() {
    const fixture = TestBed.createComponent(TopMenuComponent);
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
    const navbar = layoutElement.querySelector('.navbar');
    expect(navbar).not.toBeNull();
  });

  it(`should have correct links`, () => {
    const { fixture } = setup();
    const layoutElement: HTMLElement = fixture.nativeElement;
    const links = layoutElement.querySelectorAll('.navbar a');
    expect(links[0].textContent).toBe('VMS');
    expect(links[1].textContent).toContain('Asset');
    expect(links[2].textContent).toContain('Realtime map');
    expect(links[3].textContent).toContain('Reports map');
    expect(links[4].textContent).toContain('My Settings');
  });

});
