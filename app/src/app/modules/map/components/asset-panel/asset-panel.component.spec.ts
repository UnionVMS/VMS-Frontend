import { async, TestBed } from '@angular/core/testing';

import { TestingModule } from '@src/testing/Utils';
import { UIModule } from '@app/modules/ui/ui.module';

import { formatDate } from '@app/helpers/helpers';

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
    component.getAssetTrackTimeInterval = (historyId: string, startDate: string, endDate: string) => {};
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

  it('should correctly toggle tracks', () => {
    const { component } = setup();
    const untrackAssetSpy               = spyOn(component, 'untrackAsset');
    const getAssetTrackSpy              = spyOn(component, 'getAssetTrack');
    const getAssetTrackTimeIntervalSpy  = spyOn(component, 'getAssetTrackTimeInterval');

    let selectedAsset = component.assets.find(asset => asset.currentlyShowing);
    expect(untrackAssetSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(untrackAssetSpy).toHaveBeenCalledTimes(1);
    expect(untrackAssetSpy).toHaveBeenCalledWith(selectedAsset.asset.id);

    component['getTracksMillisecondCap'] = () => formatDate(1555490596000 - component.tracksMinuteCap * 60 * 1000);


    selectedAsset = { ...selectedAsset, assetTracks: undefined };
    expect(getAssetTrackTimeIntervalSpy).toHaveBeenCalledTimes(0);
    component['toggleTracks'](selectedAsset);
    expect(getAssetTrackTimeIntervalSpy).toHaveBeenCalledTimes(1);
    expect(getAssetTrackTimeIntervalSpy).toHaveBeenCalledWith(
      selectedAsset.asset.id,
      component['getTracksMillisecondCap'](),
      formatDate(Date.now())
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
