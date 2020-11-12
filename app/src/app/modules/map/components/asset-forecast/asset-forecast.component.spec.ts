import { waitForAsync, TestBed } from '@angular/core/testing';

import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';

import { destinationPoint } from '@app/helpers/helpers';

import { AssetForecastComponent } from './asset-forecast.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';

/* tslint:disable:no-string-literal */
describe('AssetForecastComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssetForecastComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(AssetForecastComponent);
    const component = fixture.componentInstance;

    component.assetMovements = [AssetMovementStub];
    component.map = { removeLayer: (layerName) => {} };
    component.forecastInterval = 30;

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  // Testa genom att rita ut en position, vänd på riktningen och skicka in den
  // nya positionen och då förväntar vi oss den första positionen igen.

  it('should draw forecast correctly', () => {
    const { component } = setup();
    const savedFeatures = {};
    component['vectorSource'] = {
      getFeatureById: featureId => savedFeatures[featureId],
      addFeature: feature => { savedFeatures[feature.getId()] = feature; }
    };
    component.drawFuturePosition(AssetMovementStub);
    const id = 'futurePos_0_' + AssetMovementStub.asset;
    const coordinates = savedFeatures[id].getGeometry().getCoordinates();
    const id2 = 'futurePos_1_' + AssetMovementStub.asset;
    const coordinates2 = savedFeatures[id2].getGeometry().getCoordinates();
    expect(coordinates).toEqual([2575618.876426982, 9624472.214963332]);
    const imageRotation = savedFeatures[id].getStyle().getImage().getRotation();
    expect(imageRotation).toEqual(-2.985332878257519);
    const lonLat = toLonLat(coordinates);

    component.drawFuturePosition({
      ...AssetMovementStub,
      movement: { ...AssetMovementStub.movement,
        location: {
          longitude: lonLat[0],
          latitude: lonLat[1]
        }
      }
    });
    const calculatedCord2LonLat = toLonLat(savedFeatures[id].getGeometry().getCoordinates());
    const cord2LonLat = toLonLat(coordinates2);
    expect(calculatedCord2LonLat[0].toFixed(3))
      .toEqual(cord2LonLat[0].toFixed(3));
    expect(calculatedCord2LonLat[1].toFixed(4))
      .toEqual(cord2LonLat[1].toFixed(4));

    component.drawFuturePosition({
      ...AssetMovementStub,
      movement: { ...AssetMovementStub.movement,
        heading: (AssetMovementStub.movement.heading + 180) % 360,
        location: {
          longitude: lonLat[0],
          latitude: lonLat[1]
        }
      }
    });
    const returningPosition = toLonLat(savedFeatures[id].getGeometry().getCoordinates());
    expect(returningPosition[0].toFixed(3))
      .toEqual(AssetMovementStub.movement.location.longitude.toFixed(3));
    expect(returningPosition[1].toFixed(4))
      .toEqual(AssetMovementStub.movement.location.latitude.toFixed(4));

    component.forecastInterval = null;
    component.drawFuturePosition(AssetMovementStub);
    const coordinatesWithDefaultInterval = savedFeatures['futurePos_0_' + AssetMovementStub.asset].getGeometry().getCoordinates();
    expect(coordinatesWithDefaultInterval).toEqual([2575618.876426982, 9624472.214963332]);
  });

  it('should initiate correctly', () => {
    const { component } = setup();
    component.map.addLayer = (layer) => {};
    const addLayerSpy = spyOn(component.map, 'addLayer');
    const drawFuturePositionSpy = spyOn(component, 'drawFuturePosition');
    expect(addLayerSpy).toHaveBeenCalledTimes(0);
    expect(drawFuturePositionSpy).toHaveBeenCalledTimes(0);
    component.ngOnInit();
    expect(addLayerSpy).toHaveBeenCalledTimes(1);
    expect(drawFuturePositionSpy).toHaveBeenCalledTimes(1);
    expect(drawFuturePositionSpy).toHaveBeenCalledWith(AssetMovementStub);
  });

  it('should remove track correctly', () => {
    const { component } = setup();
    let features = [];
    for (let i = 0; i < 2; i++) {
      const feature = new Feature();
      feature.setId('futurePos_' + i + '_' + AssetMovementStub.asset);
      features.push(feature);
    }

    component['vectorSource'] = {
      getFeatures: () => features,
      removeFeature: (feature) => {
        features = features.filter((value, index, arr) => value !== feature);
      }
    };
    expect(features.length).toEqual(2);
    component.removeForecast('asdsad-a-a-a-');
    expect(features.length).toEqual(2);
    component.removeForecast(AssetMovementStub.asset);
    expect(features.length).toEqual(0);
  });

  it('should update correctly', () => {
    const { component } = setup();
    component.assetMovements = [];
    let features = [];
    component['vectorSource'] = {
      getFeatureById: (featureId) => {
        const feature = features.filter((value, index, arr) => value.getId() === featureId);
        if(feature.length > 0) {
          return feature[0];
        } else {
          return null;
        }
      },
      addFeature: (feature) => {
        if(component['vectorSource'].getFeatureById(feature.getId()) === null) {
          features.push(feature);
        }
      },
      getFeatures: () => features,
      removeFeature: (feature) => {
        features = features.filter((value, index, arr) => value !== feature);
      }
    };
    component['vectorLayer'] = {
      getSource: () => ({ changed: () => {}, refresh: () => {} })
    };

    component.drawFuturePosition = (asset) => {
      for (let i = 0; i < 2; i++) {
        const feature = new Feature();
        feature.setId('futurePos_' + i + '_' + asset.asset);
        component['vectorSource'].addFeature(feature);
      }
    };

    component.ngOnChanges();
    expect(features.length).toEqual(0);

    component.assetMovements = [AssetMovementStub];
    component.ngOnChanges();
    expect(features.length).toEqual(2);

    // Nothing should change
    component.ngOnChanges();
    expect(features.length).toEqual(2);

    component.assetMovements = [];
    component.ngOnChanges();
    expect(features.length).toEqual(0);
  });


});
