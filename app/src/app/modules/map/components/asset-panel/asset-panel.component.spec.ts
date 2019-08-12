import { async, TestBed } from '@angular/core/testing';

import { TestingModule } from '@testing/Utils';
import { UIModule } from '@app/modules/ui/ui.module';

import { formatDate } from '@app/helpers';

import { AssetPanelComponent } from './asset-panel.component';
import AssetMovementStub from '@data/asset/stubs/assetMovement.stub';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';

/* tslint:disable:no-string-literal */
describe('AssetPanelComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        UIModule
      ],
      declarations: [
        AssetPanelComponent
      ]
    })
    .compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(AssetPanelComponent);
    const component = fixture.componentInstance;

    component.assets = [
      {
        asset: AssetStub,
        assetTracks: AssetTrackStub,
        currentPosition: AssetMovementStub,
        currentlyShowing: true
      }
    ];

    component.getAssetTrack = (historyId: string, movementGuid: string) => {};
    component.getAssetTrackFromTime = (historyId: string, date: string) => {};
    component.untrackAsset = (historyId: string) => {};
    component.addForecast = (historyId: string) => {};
    component.removeForecast = (historyId: string) => {};
    component.forecasts = {};
    component.tracksMinuteCap = 30;

    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  // TODO: Rewrite after refactoring
  it('should correctly toggle tracks', () => {
    const { component } = setup();
    const untrackAssetSpy           = spyOn(component, 'untrackAsset');
    const getAssetTrackSpy          = spyOn(component, 'getAssetTrack');
    const getAssetTrackFromTimeSpy  = spyOn(component, 'getAssetTrackFromTime');

    const selectedAsset = component.assets.find(asset => asset.currentlyShowing);
    expect(untrackAssetSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(untrackAssetSpy).toHaveBeenCalledTimes(1);
    expect(untrackAssetSpy).toHaveBeenCalledWith(selectedAsset.asset.id);

    component['getTracksMillisecondCap'] = () => formatDate(1555490596000 - component.tracksMinuteCap * 60 * 1000);

    delete selectedAsset.assetTracks;
    expect(getAssetTrackFromTimeSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(getAssetTrackFromTimeSpy).toHaveBeenCalledTimes(1);
    expect(getAssetTrackFromTimeSpy).toHaveBeenCalledWith(
      selectedAsset.asset.id, component['getTracksMillisecondCap']()
    );

    component.tracksMinuteCap = null;
    expect(getAssetTrackSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(getAssetTrackSpy).toHaveBeenCalledTimes(1);
    expect(getAssetTrackSpy).toHaveBeenCalledWith(
      selectedAsset.asset.id, selectedAsset.currentPosition.microMove.guid
    );
  });

  it('should correctly toggle forecast', () => {
    const { component } = setup();
    const removeForecastSpy = spyOn(component, 'removeForecast');
    const addForecastSpy    = spyOn(component, 'addForecast');

    const selectedAsset = component.assets.find(asset => asset.currentlyShowing);

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

  it('should correctly toggle visibility', () => {
    const { component } = setup();

    const isHidden = component.hidePanel;
    component['toggleVisibility']();
    expect(component.hidePanel).not.toEqual(isHidden);
    component['toggleVisibility']();
    expect(component.hidePanel).toEqual(isHidden);
  });

});
