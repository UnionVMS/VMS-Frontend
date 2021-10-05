import { waitForAsync, TestBed } from '@angular/core/testing';

import { DistanceBetweenPointsComponent } from './distance-between-points.component';

describe('DistanceBetweenPointsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DistanceBetweenPointsComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(DistanceBetweenPointsComponent);
    const component = fixture.componentInstance;
    component.map = { removeLayer: (layer) => {}, removeInteraction: (interaction) => {}};
    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
