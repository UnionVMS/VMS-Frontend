import { waitForAsync, TestBed } from '@angular/core/testing';

import { UIModule } from '@app/modules/ui/ui.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

// @ts-ignore
import moment from 'moment-timezone';

import { AssetPanelComponent } from './asset-panel.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';
import { PanelBlockComponent } from '../panel-block/panel-block.component';

/* tslint:disable:no-string-literal */
describe('AssetPanelComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        UIModule,
        MatCheckboxModule
      ],
      declarations: [
        AssetPanelComponent,
        PanelBlockComponent
      ]
    })
    .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(AssetPanelComponent);
    const component = fixture.componentInstance;

    component.asset = {
      asset: AssetStub,
      assetTracks: AssetTrackStub,
      currentPosition: AssetMovementStub,
      currentlyShowing: true
    };

    component.getAssetTrack = (historyId: string, movementId: string) => {};
    component.getAssetTrackTimeInterval = (historyId: string, startDate: number, endDate: number) => {};
    component.untrackAsset = (historyId: string) => {};
    component.addForecast = (historyId: string) => {};
    component.removeForecast = (historyId: string) => {};
    component.forecasts = {};
    component.tracksMinuteCap = 30;
    component.centerMapOnPosition = (longAndLat) => {};

    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should correctly toggle tracks', () => {
    const { component } = setup();
    const untrackAssetSpy               = spyOn(component, 'untrackAsset');
    const getAssetTrackSpy              = spyOn(component, 'getAssetTrack');
    const getAssetTrackTimeIntervalSpy  = spyOn(component, 'getAssetTrackTimeInterval');

    let selectedAsset = component.asset;
    expect(untrackAssetSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(untrackAssetSpy).toHaveBeenCalledTimes(1);
    expect(untrackAssetSpy).toHaveBeenCalledWith(selectedAsset.asset.id);

    component['getTracksMillisecondCap'] = () => (1555490596000 - component.tracksMinuteCap * 60 * 1000).toString();

    selectedAsset = { ...selectedAsset, assetTracks: undefined };
    expect(getAssetTrackTimeIntervalSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(getAssetTrackTimeIntervalSpy).toHaveBeenCalledTimes(1);

    component.tracksMinuteCap = null;
    expect(getAssetTrackSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(getAssetTrackSpy).toHaveBeenCalledTimes(1);
    expect(getAssetTrackSpy).toHaveBeenCalledWith(
      selectedAsset.asset.id, selectedAsset.currentPosition.movement.id
    );
  });

  it('should correctly toggle forecast', () => {
    const { component } = setup();
    const removeForecastSpy = spyOn(component, 'removeForecast');
    const addForecastSpy    = spyOn(component, 'addForecast');

    const selectedAsset = component.asset;

    expect(addForecastSpy).toHaveBeenCalledTimes(0);
    component['toggleForecast'](selectedAsset.asset.id);
    expect(addForecastSpy).toHaveBeenCalledTimes(1);
    expect(addForecastSpy).toHaveBeenCalledWith(selectedAsset.asset.id);

    component.forecasts = { [selectedAsset.asset.id]: {}};

    expect(removeForecastSpy).toHaveBeenCalledTimes(0);
    component['toggleForecast'](selectedAsset.asset.id);
    expect(removeForecastSpy).toHaveBeenCalledTimes(1);
    expect(removeForecastSpy).toHaveBeenCalledWith(selectedAsset.asset.id);
  });

  it('should correctly center map on asset', () => {
    const { component } = setup();
    const centerMapOnPositionSpy = spyOn(component, 'centerMapOnPosition');


    expect(centerMapOnPositionSpy).toHaveBeenCalledTimes(0);
    component['goToAsset'](component.asset);
    expect(centerMapOnPositionSpy).toHaveBeenCalledTimes(1);
    expect(centerMapOnPositionSpy).toHaveBeenCalledWith(
      component.asset.currentPosition.movement.location
    );
  });
});
