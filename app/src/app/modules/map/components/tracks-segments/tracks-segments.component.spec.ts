import { waitForAsync, TestBed } from '@angular/core/testing';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
import { fromLonLat } from 'ol/proj';
import { deg2rad } from '@app/helpers/helpers';

import { TracksSegmentsComponent } from './tracks-segments.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';

/* tslint:disable:no-string-literal */
describe('tracksSegmentsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        TracksSegmentsComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TracksSegmentsComponent);
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

  it('should create line segment', () => {
    const { component } = setup();
    expect(component['renderedFeatureIds'].length).toEqual(0);
    component.createLineSegment(AssetTrackStub.assetId, AssetTrackStub.lineSegments[0]);
    expect(component['renderedFeatureIds'].length).toEqual(1);
    expect(component['renderedFeatureIds'][0]).toEqual('line_segment_' + AssetTrackStub.assetId + '_' + AssetTrackStub.lineSegments[0].id);
  });

});
