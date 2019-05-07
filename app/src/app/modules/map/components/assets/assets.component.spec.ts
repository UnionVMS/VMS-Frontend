import { async, TestBed } from '@angular/core/testing';

import { deg2rad } from '@app/helpers';
import { fromLonLat } from 'ol/proj';
import { TestingModule } from '@testing/Utils';

import { AssetsComponent } from './assets.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';

/* tslint:disable:no-string-literal */
describe('AssetsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule
      ],
      declarations: [
        AssetsComponent
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(AssetsComponent);
    const component = fixture.componentInstance;
    component.assets = [];
    component.map = { removeLayer: (layer) => {}};
    component.namesVisible = false;
    component.speedsVisible = true;
    component.selectAsset = () => {};
    component.registerOnClickFunction = () => {};
    component.unregisterOnClickFunction = () => {};
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should generate the correct text below asset', () => {
    const { component } = setup();
    component.namesVisible = true;
    component.speedsVisible = false;
    let text = component.getTextStyleForName(AssetMovementStub);
    expect(text.getText()).toEqual(AssetMovementStub.assetName);
    expect(text.getOffsetY()).toEqual(20);

    component.speedsVisible = true;
    text = component.getTextStyleForName(AssetMovementStub);
    expect(text.getText()).toEqual(AssetMovementStub.assetName + '\n' + AssetMovementStub.microMove.speed.toFixed(2) + ' kts');
    expect(text.getOffsetY()).toEqual(30);

    component.namesVisible = false;
    text = component.getTextStyleForName(AssetMovementStub);
    expect(text.getText()).toEqual(AssetMovementStub.microMove.speed.toFixed(2) + ' kts');
    expect(text.getOffsetY()).toEqual(20);
  });

  it('should create feature from asset correctly', () => {
    const { component } = setup();

    const feature = component.createFeatureFromAsset(AssetMovementStub);
    expect(feature.getId()).toEqual(AssetMovementStub.asset);
    expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      AssetMovementStub.microMove.location.longitude, AssetMovementStub.microMove.location.latitude
    ]));
    expect(feature.getStyle().getImage().getRotation()).toEqual(deg2rad(AssetMovementStub.microMove.heading));

    const textStyle = feature.getStyle().getText();
    expect(textStyle.getText()).toEqual(AssetMovementStub.microMove.speed.toFixed(2) + ' kts');
    expect(textStyle.getOffsetY()).toEqual(20);
  });

  it('should create feature from asset correctly', () => {
    const { component } = setup();

    const feature = component.createFeatureFromAsset(AssetMovementStub);
    const updatedAsset = { ...AssetMovementStub,
      microMove: {
        ...AssetMovementStub.microMove,
        location: {
          ...AssetMovementStub.microMove.location,
          longitude: 11.11
        },
        heading: 2
      }
    };
    component.speedsVisible = false;
    const updatedFeature = component.updateFeatureFromAsset(feature, updatedAsset);
    component['namesWereVisibleLastRerender'] = component.namesVisible;
    component['speedsWereVisibleLastRerender'] = component.speedsVisible;

    expect(updatedFeature.getId()).toEqual(feature.getId());
    expect(updatedFeature.getGeometry().getCoordinates()).toEqual(fromLonLat([
      updatedAsset.microMove.location.longitude, updatedAsset.microMove.location.latitude
    ]));
    expect(updatedFeature.getStyle().getImage().getRotation()).toEqual(deg2rad(updatedAsset.microMove.heading));

    component.namesVisible = true;
    const updatedFeatureWithName = component.updateFeatureFromAsset(updatedFeature, updatedAsset);
    component['namesWereVisibleLastRerender'] = component.namesVisible;
    component['speedsWereVisibleLastRerender'] = component.speedsVisible;
    expect(updatedFeatureWithName.getId()).toEqual(updatedFeature.getId());
    expect(updatedFeatureWithName.getStyle().getText().getText()).toEqual(updatedAsset.assetName);

    component.speedsVisible = true;
    const updatedFeatureWithSpeed = component.updateFeatureFromAsset(updatedFeatureWithName, updatedAsset);
    component['namesWereVisibleLastRerender'] = component.namesVisible;
    component['speedsWereVisibleLastRerender'] = component.speedsVisible;
    expect(updatedFeatureWithSpeed.getId()).toEqual(updatedFeatureWithName.getId());
    expect(updatedFeatureWithSpeed.getStyle().getText().getText())
      .toEqual(updatedAsset.assetName + '\n' + updatedAsset.microMove.speed.toFixed(2) + ' kts');

    const fasterAsset = { ...updatedAsset,
      microMove: {
        ...updatedAsset.microMove,
        speed: 12.7
      }
    };
    const updatedFeatureWithExtraSpeed = component.updateFeatureFromAsset(updatedFeatureWithSpeed, fasterAsset);
    component['namesWereVisibleLastRerender'] = component.namesVisible;
    component['speedsWereVisibleLastRerender'] = component.speedsVisible;
    expect(updatedFeatureWithExtraSpeed.getStyle().getText().getText())
      .toEqual(fasterAsset.assetName + '\n' + fasterAsset.microMove.speed.toFixed(2) + ' kts');
  });

  it('should init correctly', () => {
    const { component } = setup();
    component.map.addLayer = (layer) => {};
    let registeredFunction = (event): void => {};
    component.registerOnClickFunction = (name, func) => registeredFunction = func;
    component.assets = [AssetMovementStub];
    const addLayerSpy = spyOn(component.map, 'addLayer');
    expect(addLayerSpy).toHaveBeenCalledTimes(0);
    component.ngOnInit();
    expect(addLayerSpy).toHaveBeenCalledTimes(1);
    const selectAssetSpy = spyOn(component, 'selectAsset');
    expect(selectAssetSpy).toHaveBeenCalledTimes(0);
    registeredFunction({
      type: 'select',
      selected: [{ id_: AssetMovementStub.asset }],
      deselected: []
    });
    expect(selectAssetSpy).toHaveBeenCalledTimes(1);
    expect(selectAssetSpy).toHaveBeenCalledWith(AssetMovementStub.asset);
    expect(component['vectorSource'].getFeatures().length).toEqual(1);
  });

  it('should update correctly', () => {
    const { component } = setup();
    component.map.addLayer = (layer) => {};
    component.registerOnClickFunction = (name, func) => {};
    component.ngOnInit();

    component.assets = [AssetMovementStub];
    expect(component['vectorSource'].getFeatures().length).toEqual(0);
    component.ngOnChanges();
    expect(component['vectorSource'].getFeatures().length).toEqual(1);
    const fastAsset = { ...AssetMovementStub,  microMove: { ...AssetMovementStub.microMove, speed: 12.7 } };
    component.assets = [fastAsset];
    expect(component['vectorSource'].getFeatures()[0].getStyle().getText().getText())
      .toEqual(AssetMovementStub.microMove.speed.toFixed(2) + ' kts');
    component.ngOnChanges();
    expect(component['vectorSource'].getFeatures().length).toEqual(1);
    expect(component['vectorSource'].getFeatures()[0].getStyle().getText().getText())
      .toEqual(fastAsset.microMove.speed.toFixed(2) + ' kts');
  });

});
