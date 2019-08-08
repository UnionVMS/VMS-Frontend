import { async, TestBed } from '@angular/core/testing';

import { deg2rad } from '@app/helpers';
import { fromLonLat } from 'ol/proj';
import { TestingModule } from '@testing/Utils';

import { AssetsComponent } from './assets.component';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';

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
    component['namesVisible'] = false;
    component['speedsVisible'] = true;
    component['namesVisibleCalculated'] = false;
    component['speedsVisibleCalculated'] = true;
    component.selectAsset = () => {};
    component.registerOnSelectFunction = () => {};
    component.unregisterOnSelectFunction = () => {};
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  // TODO: Rewrite afrer refactoring
  // it('should generate the correct text below asset', () => {
  //   const { component } = setup();
  //   component['namesVisibleCalculated'] = true;
  //   component['speedsVisibleCalculated'] = false;
  //   let text = component.getTextStyleForName(AssetMovementWithEssentialsStub);
  //   expect(text.getText()).toEqual(AssetMovementWithEssentialsStub.assetEssentials.assetName);
  //   expect(text.getOffsetY()).toEqual(20);
  //
  //   component['speedsVisibleCalculated'] = true;
  //   text = component.getTextStyleForName(AssetMovementWithEssentialsStub);
  //   expect(text.getText()).toEqual(
  //     AssetMovementWithEssentialsStub.assetEssentials.assetName + '\n' +
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.speed.toFixed(2) + ' kts'
  //   );
  //   expect(text.getOffsetY()).toEqual(30);
  //
  //   component['namesVisibleCalculated'] = false;
  //   text = component.getTextStyleForName(AssetMovementWithEssentialsStub);
  //   expect(text.getText()).toEqual(AssetMovementWithEssentialsStub.assetMovement.microMove.speed.toFixed(2) + ' kts');
  //   expect(text.getOffsetY()).toEqual(20);
  // });
  //
  // it('should create feature from asset correctly', () => {
  //   const { component } = setup();
  //
  //   const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
  //   expect(feature.getId()).toEqual(AssetMovementWithEssentialsStub.assetEssentials.assetId);
  //   expect(feature.getGeometry().getCoordinates()).toEqual(fromLonLat([
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.longitude,
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.location.latitude
  //   ]));
  //   expect(feature.getStyle().getImage().getRotation()).toEqual(deg2rad(
  //     AssetMovementWithEssentialsStub.assetMovement.microMove.heading
  //   ));
  //
  //   const textStyle = feature.getStyle().getText();
  //   expect(textStyle.getText()).toEqual(AssetMovementWithEssentialsStub.assetMovement.microMove.speed.toFixed(2) + ' kts');
  //   expect(textStyle.getOffsetY()).toEqual(20);
  // });
  //
  // it('should create feature from asset correctly', () => {
  //   const { component } = setup();
  //
  //   const feature = component.createFeatureFromAsset(AssetMovementWithEssentialsStub);
  //   const updatedAsset = { ...AssetMovementWithEssentialsStub,
  //     assetMovement: { ...AssetMovementWithEssentialsStub.assetMovement,
  //       microMove: {
  //         ...AssetMovementWithEssentialsStub.assetMovement.microMove,
  //         location: {
  //           ...AssetMovementWithEssentialsStub.assetMovement.microMove.location,
  //           longitude: 11.11
  //         },
  //         heading: 2
  //       }
  //     }
  //   };
  //   component['speedsVisibleCalculated'] = false;
  //   const updatedFeature = component.updateFeatureFromAsset(feature, updatedAsset);
  //   component['namesWereVisibleLastRerender'] = component['namesVisibleCalculated'];
  //   component['speedsWereVisibleLastRerender'] = component['speedsVisibleCalculated'];
  //
  //   expect(updatedFeature.getId()).toEqual(feature.getId());
  //   expect(updatedFeature.getGeometry().getCoordinates()).toEqual(fromLonLat([
  //     updatedAsset.assetMovement.microMove.location.longitude, updatedAsset.assetMovement.microMove.location.latitude
  //   ]));
  //   expect(updatedFeature.getStyle().getImage().getRotation()).toEqual(deg2rad(updatedAsset.assetMovement.microMove.heading));
  //
  //   component['namesVisibleCalculated'] = true;
  //   const updatedFeatureWithName = component.updateFeatureFromAsset(updatedFeature, updatedAsset);
  //   component['namesWereVisibleLastRerender'] = component['namesVisibleCalculated'];
  //   component['speedsWereVisibleLastRerender'] = component['speedsVisibleCalculated'];
  //   expect(updatedFeatureWithName.getId()).toEqual(updatedFeature.getId());
  //   expect(updatedFeatureWithName.getStyle().getText().getText()).toEqual(updatedAsset.assetEssentials.assetName);
  //
  //   component['speedsVisibleCalculated'] = true;
  //   const updatedFeatureWithSpeed = component.updateFeatureFromAsset(updatedFeatureWithName, updatedAsset);
  //   component['namesWereVisibleLastRerender'] = component['namesVisibleCalculated'];
  //   component['speedsWereVisibleLastRerender'] = component['speedsVisibleCalculated'];
  //   expect(updatedFeatureWithSpeed.getId()).toEqual(updatedFeatureWithName.getId());
  //   expect(updatedFeatureWithSpeed.getStyle().getText().getText())
  //     .toEqual(updatedAsset.assetEssentials.assetName + '\n' + updatedAsset.assetMovement.microMove.speed.toFixed(2) + ' kts');
  //
  //   const fasterAsset =  { ...updatedAsset,
  //     assetMovement: { ...updatedAsset.assetMovement,
  //       microMove: {
  //         ...updatedAsset.assetMovement.microMove,
  //         speed: 12.7
  //       }
  //     }
  //   };
  //   const updatedFeatureWithExtraSpeed = component.updateFeatureFromAsset(updatedFeatureWithSpeed, fasterAsset);
  //   component['namesWereVisibleLastRerender'] = component['namesVisibleCalculated'];
  //   component['speedsWereVisibleLastRerender'] = component['speedsVisibleCalculated'];
  //   expect(updatedFeatureWithExtraSpeed.getStyle().getText().getText())
  //     .toEqual(fasterAsset.assetEssentials.assetName + '\n' + fasterAsset.assetMovement.microMove.speed.toFixed(2) + ' kts');
  // });
  //
  // it('should init correctly', () => {
  //   const { component } = setup();
  //   component.map.addLayer = (layer) => {};
  //   let registeredFunction = (event): void => {};
  //   component.registerOnClickFunction = (name, func) => registeredFunction = func;
  //   component.assets = [AssetMovementWithEssentialsStub];
  //   const addLayerSpy = spyOn(component.map, 'addLayer');
  //   expect(addLayerSpy).toHaveBeenCalledTimes(0);
  //   component.ngOnInit();
  //   expect(addLayerSpy).toHaveBeenCalledTimes(1);
  //   const selectAssetSpy = spyOn(component, 'selectAsset');
  //   expect(selectAssetSpy).toHaveBeenCalledTimes(0);
  //   registeredFunction({
  //     type: 'select',
  //     selected: [{ id_: AssetMovementWithEssentialsStub.assetEssentials.assetId }],
  //     deselected: []
  //   });
  //   expect(selectAssetSpy).toHaveBeenCalledTimes(1);
  //   expect(selectAssetSpy).toHaveBeenCalledWith(AssetMovementWithEssentialsStub.assetEssentials.assetId);
  //   expect(component['vectorSource'].getFeatures().length).toEqual(1);
  // });
  //
  // it('should update correctly', () => {
  //   const { component } = setup();
  //   component.map.addLayer = (layer) => {};
  //   component.registerOnClickFunction = (name, func) => {};
  //   component.ngOnInit();
  //
  //   component.assets = [AssetMovementWithEssentialsStub];
  //   expect(component['vectorSource'].getFeatures().length).toEqual(0);
  //   component.ngOnChanges();
  //   expect(component['vectorSource'].getFeatures().length).toEqual(1);
  //   const fastAsset = { ...AssetMovementWithEssentialsStub,
  //     assetMovement: { ...AssetMovementWithEssentialsStub.assetMovement,
  //       microMove: { ...AssetMovementWithEssentialsStub.assetMovement.microMove, speed: 12.7 }
  //     }
  //   };
  //   component.assets = [fastAsset];
  //   expect(component['vectorSource'].getFeatures()[0].getStyle().getText().getText())
  //     .toEqual(AssetMovementWithEssentialsStub.assetMovement.microMove.speed.toFixed(2) + ' kts');
  //   component.ngOnChanges();
  //   expect(component['vectorSource'].getFeatures().length).toEqual(1);
  //   expect(component['vectorSource'].getFeatures()[0].getStyle().getText().getText())
  //     .toEqual(fastAsset.assetMovement.microMove.speed.toFixed(2) + ' kts');
  // });

});
