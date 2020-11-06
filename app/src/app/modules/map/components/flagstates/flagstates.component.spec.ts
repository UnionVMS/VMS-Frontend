import { waitForAsync, TestBed } from '@angular/core/testing';

import { deg2rad } from '@app/helpers/helpers';
import { fromLonLat } from 'ol/proj';

import { FlagstatesComponent } from './flagstates.component';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
import AssetEssentialsStub from '@data/asset/stubs/assetEssentials.stub';

import getContryISO2 from 'country-iso-3-to-2';

/* tslint:disable:no-string-literal */
describe('FlagstatesComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        FlagstatesComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(FlagstatesComponent);
    const component = fixture.componentInstance;
    component.assets = [];
    component.map = { removeLayer: (layer) => {}};
    component.selectAsset = () => {};
    component.registerOnSelectFunction = () => {};
    component.unregisterOnSelectFunction = () => {};
    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should create feature from asset correctly', () => {
    const { component } = setup();

    const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
    expect(feature.getId()).toEqual(`flag_${AssetMovementWithEssentialsStub.assetEssentials.assetId}`);
    expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      AssetMovementWithEssentialsStub.assetMovement.movement.location.longitude,
      AssetMovementWithEssentialsStub.assetMovement.movement.location.latitude
    ]));
    expect(component['flagCanvasByCountry'][getContryISO2(AssetMovementWithEssentialsStub.assetEssentials.flagstate).toLowerCase()])
      .not.toBeUndefined();

    const assetWithBadFlag = { ...AssetMovementWithEssentialsStub, assetEssentials: { ...AssetEssentialsStub, flagstate: 'gibberish' }};
    const shouldFailsFeature = component.createFeatureFromAsset(assetWithBadFlag);
    expect(shouldFailsFeature).toBeFalsy();
  });

  it('should update feature correctly', () => {
    const { component } = setup();

    const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
    expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      AssetMovementWithEssentialsStub.assetMovement.movement.location.longitude,
      AssetMovementWithEssentialsStub.assetMovement.movement.location.latitude
    ]));

    const movement = { ...AssetMovementWithEssentialsStub.assetMovement,
      movement: { ...AssetMovementWithEssentialsStub.assetMovement.movement,
        location: {
          longitude: 13.37,
          latitude:  112.911
        },
      },
    };

    component.updateFeatureFromAsset(feature, movement);
    expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      movement.movement.location.longitude,
      movement.movement.location.latitude
    ]));

  });
});
