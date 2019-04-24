import { async, TestBed } from '@angular/core/testing';
import { Stroke, Style, Icon, Fill, Text } from 'ol/style.js';
import { fromLonLat } from 'ol/proj';
import { TestingModule } from '@testing/Utils';
import { deg2rad } from '@app/helpers';

import { TracksComponent } from './tracks.component';
import AssetStub from '@data/asset/stubs/asset.stub';
import FullAssetStub from '@data/asset/stubs/fullAsset.stub';
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

    component.unregisterOnClickFunction = (layerName) => {};
    component.map = {
      removeLayer: (vectorLayer) => {}
    };
    component.registerOnClickFunction = () => {};
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

  it('should hide arrow depending on zoom level', () => {
    const { component } = setup();
    const movement = AssetTrackStub.tracks[0];
    const assetId = AssetTrackStub.assetId;
    const arrowFeature = component.createArrowFeature(assetId, movement);
    const arrowFeatureImage = arrowFeature.getStyle().getImage();
    expect(arrowFeatureImage.getOpacity()).toEqual(1);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 5, 39);
    expect(arrowFeatureImage.getOpacity()).toEqual(0);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 5, 40);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    component.hideArrowDependingOnZoomLevel(arrowFeature, 5, 20);
    expect(arrowFeatureImage.getOpacity()).toEqual(0);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 5, 20, true);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    component.hideArrowDependingOnZoomLevel(arrowFeature, 8, 20);
    expect(arrowFeatureImage.getOpacity()).toEqual(0);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 8, 16);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    component.hideArrowDependingOnZoomLevel(arrowFeature, 10, 20);
    expect(arrowFeatureImage.getOpacity()).toEqual(0);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 10, 12);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    component.hideArrowDependingOnZoomLevel(arrowFeature, 13, 3);
    expect(arrowFeatureImage.getOpacity()).toEqual(0);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 13, 2);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    component.hideArrowDependingOnZoomLevel(arrowFeature, 14, 75);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 14, 2);
    expect(arrowFeatureImage.getOpacity()).toEqual(1);

    const markerStyle = new Style({
      image: new Icon({
        src: './assets/flags/icon.png',
        anchor: [0.5, 1.1],
        rotateWithView: true,
        color: '#000000',
        opacity: 0.75
      }),
      text: new Text({
        font: '13px Calibri,sans-serif',
        fill: new Fill({ color: '#FFFFFF' }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2
        }),
        offsetY: -22,
        text: 'Blubb!'
      })
    });
    arrowFeature.setStyle([arrowFeature.getStyle(), markerStyle]);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 13, 3);
    expect(arrowFeature.getStyle().map((style) => style.getImage().getOpacity())).toEqual([0, 0]);
    component.hideArrowDependingOnZoomLevel(arrowFeature, 13, 2);
    expect(arrowFeature.getStyle().map((style) => style.getImage().getOpacity())).toEqual([1, 1]);
  });

  it('should create arrow features', () => {
    const { component } = setup();
    const arrowFeatures = component.createArrowFeatures(AssetTrackStub);
    expect(arrowFeatures.length).toEqual(4);
  });


});
