import { async, TestBed } from '@angular/core/testing';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
import { fromLonLat } from 'ol/proj';
import { deg2rad } from '@app/helpers/helpers';

import { TracksComponent } from './tracks.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';

/* tslint:disable:no-string-literal */
describe('AssetTracksComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TracksComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TracksComponent);
    const component = fixture.componentInstance;

    component.map = {
      removeLayer: (vectorLayer) => {}
    };
    component.assetTracks = [AssetTrackStub];

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should create feature', () => {
    const { component } = setup();
    const movement = AssetTrackStub.tracks[0];
    const assetId = AssetTrackStub.assetId;
    expect(typeof component['renderedFeatureIdsByAssetId'][assetId]).toBe('undefined');
    component['renderedFeatureIdsByAssetId'][assetId] = [];
    const feature = component.createNewTrackPosition(assetId, movement);
    const featureAssetId = 'assetId_' + assetId + '_movementId_' + movement.id;
    expect(component['renderedFeatureIdsByAssetId'][assetId].length).toEqual(1);
    expect(component['renderedFeatureIdsByAssetId'][assetId][0]).toEqual(featureAssetId);
    expect(feature.getId()).toEqual(featureAssetId);
    expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ]));
    // expect(feature.getStyle().getImage().getRotation()).toEqual(deg2rad(movement.heading));
  });

});
