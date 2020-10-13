import { waitForAsync, TestBed } from '@angular/core/testing';

import { deg2rad } from '@app/helpers/helpers';
import { fromLonLat } from 'ol/proj';

import { DistanceBetweenPointsComponent } from './distance-between-points.component';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
import AssetEssentialsStub from '@data/asset/stubs/assetEssentials.stub';

import getContryISO2 from 'country-iso-3-to-2';

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
