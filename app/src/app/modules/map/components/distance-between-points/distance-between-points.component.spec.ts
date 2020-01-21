import { async, TestBed } from '@angular/core/testing';

import { deg2rad } from '@app/helpers/helpers';
import { fromLonLat } from 'ol/proj';
import { TestingModule } from '@src/testing/Utils';

import { DistanceBetweenPointsComponent } from './distance-between-points.component';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
import AssetEssentialsStub from '@data/asset/stubs/assetEssentials.stub';

import getContryISO2 from 'country-iso-3-to-2';

/* tslint:disable:no-string-literal */
describe('DistanceBetweenPointsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule
      ],
      declarations: [
        DistanceBetweenPointsComponent
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(DistanceBetweenPointsComponent);
    const component = fixture.componentInstance;
    // @Input() map: Map;
    // @Input() registerOnClickFunction: (name: string, clickEvent: (event) => void) => void;
    // @Input() active: boolean;
    // @Input() unitOfDistance: string;
    // component.assets = [];
    component.map = { removeLayer: (layer) => {}, removeInteraction: (interaction) => {}};
    // component.selectAsset = () => {};
    // component.registerOnSelectFunction = () => {};
    // component.unregisterOnSelectFunction = () => {};
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
  //
  // it('should create feature from asset correctly', () => {
  //   const { component } = setup();
  //
  //   const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
  //   expect(feature.getId()).toEqual(`flag_${AssetMovementWithEssentialsStub.assetEssentials.assetId}`);
  //   expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.longitude,
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.latitude
  //   ]));
  //   expect(component['flagCanvasByCountry'][getContryISO2(AssetMovementWithEssentialsStub.assetEssentials.flagstate).toLowerCase()])
  //     .not.toBeUndefined();
  //
  //   const assetWithBadFlag = { ...AssetMovementWithEssentialsStub, assetEssentials: { ...AssetEssentialsStub, flagstate: 'gibberish' }};
  //   const shouldFailsFeature = component.createFeatureFromAsset(assetWithBadFlag);
  //   expect(shouldFailsFeature).toBeFalsy();
  // });
  //
  // it('should update feature correctly', () => {
  //   const { component } = setup();
  //
  //   const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
  //   expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.longitude,
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.latitude
  //   ]));
  //
  //   const movement = { ...AssetMovementWithEssentialsStub.assetMovement,
  //     microMove: { ...AssetMovementWithEssentialsStub.assetMovement.microMove,
  //       location: {
  //         longitude: 13.37,
  //         latitude:  112.911
  //       },
  //     },
  //   };
  //
  //   component.updateFeatureFromAsset(feature, movement);
  //   expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
  //     movement.microMove.location.longitude,
  //     movement.microMove.location.latitude
  //   ]));
  //
  // });
});
