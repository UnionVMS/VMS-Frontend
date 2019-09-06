import { async, TestBed } from '@angular/core/testing';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
import { fromLonLat } from 'ol/proj';
import { TestingModule } from '@src/testing/Utils';
import { deg2rad } from '@app/helpers';

import { TracksComponent } from './tracks.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';

/* tslint:disable:no-string-literal */
describe('AssetForecastComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule
      ],
      declarations: [
        TracksComponent
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(TracksComponent);
    const component = fixture.componentInstance;

    component.unregisterOnSelectFunction = (layerName) => {};
    component.map = {
      removeLayer: (vectorLayer) => {}
    };
    component.registerOnSelectFunction = () => {};
    component.mapZoom = 6;
    component.addPositionForInspection = (pos) => {};
    component.assetTracks = [AssetTrackStub];
    component.positionsForInspection = {};

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should create arrow feature', () => {
    const { component } = setup();
    const movement = AssetTrackStub.tracks[0];
    const assetId = AssetTrackStub.assetId;
    expect(component['renderedFeatureIds'].length).toEqual(0);
    const arrowFeature = component.createArrowFeature(assetId, movement);
    const featureAssetId = 'assetId_' + assetId + '_guid_' + movement.guid;
    expect(component['renderedFeatureIds'].length).toEqual(1);
    expect(component['renderedFeatureIds'][0]).toEqual(featureAssetId);
    expect(arrowFeature.getId()).toEqual(featureAssetId);
    expect(arrowFeature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      movement.location.longitude, movement.location.latitude
    ]));
    expect(arrowFeature.getStyle().getImage().getRotation()).toEqual(deg2rad(movement.heading));
  });

  it('should hide features depending on zoom level per hour', () => {
    const { component } = setup();
    // const movement = AssetTrackStub.tracks[0];
    const assetId = AssetTrackStub.assetId;
    const featureArrowsPerHour = {};

    const arrowFeatures = AssetTrackStub.tracks.map(movement => {
      const arrowFeature = component.createArrowFeature(assetId, movement);
      const dateWithHour = movement.timestamp.substring(0, 13);
      if(typeof featureArrowsPerHour[dateWithHour] === 'undefined') {
        featureArrowsPerHour[dateWithHour] = [];
      }
      featureArrowsPerHour[dateWithHour].push({ feature: arrowFeature, forceShow: false });

      return arrowFeature;
    });
    // const arrowFeature = component.createArrowFeature(assetId, movement);

    const arrowFeatureImages = arrowFeatures.map(arrowFeature => arrowFeature.getStyle().getImage());
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual([1, 1, 1, 1, 1, 1, 1]);

    // Should only show one
    component.showXArrowsPerHour(featureArrowsPerHour, 8);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual(
      [1, 0.002, 0.002, 0.002, 0.002, 0.002, 0.002]
    );

    // Should only show two
    component.showXArrowsPerHour(featureArrowsPerHour, 9);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual(
      [1, 0.002, 0.002, 0.002, 1, 0.002, 0.002]
    );

    // Should only show four
    component.showXArrowsPerHour(featureArrowsPerHour, 10);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual(
      [1, 0.002, 1, 0.002, 1, 0.002, 1]
    );

    // Should all of them (max 7 / hour)
    component.showXArrowsPerHour(featureArrowsPerHour, 12);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual([1, 1, 1, 1, 1, 1, 1]);

    // Should all of them  (max 9 / hour)
    component.showXArrowsPerHour(featureArrowsPerHour, 14);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual([1, 1, 1, 1, 1, 1, 1]);

    // Should all of them  (max 11 / hour)
    component.showXArrowsPerHour(featureArrowsPerHour, 16);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual([1, 1, 1, 1, 1, 1, 1]);

    // Should all of them  (any number / hour)
    component.showXArrowsPerHour(featureArrowsPerHour, 17);
    expect(arrowFeatureImages.map(image => image.getOpacity())).toEqual([1, 1, 1, 1, 1, 1, 1]);

  });

  // it('should create arrow features', () => {
  //   const { component } = setup();
  //   const arrowFeatures = component.createArrowFeatures(AssetTrackStub);
  //   expect(arrowFeatures.length).toEqual(4);
  // });

  it('should create line segment', () => {
    const { component } = setup();
    expect(component['renderedFeatureIds'].length).toEqual(0);
    component.createLineSegment(AssetTrackStub.assetId, AssetTrackStub.lineSegments[0], 0);
    expect(component['renderedFeatureIds'].length).toEqual(1);
    expect(component['renderedFeatureIds'][0]).toEqual('line_segment_' + AssetTrackStub.assetId + '_' + 0);
  });

});
