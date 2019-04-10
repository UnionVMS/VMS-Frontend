import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Store } from '@ngrx/store';
import { TestingModule } from '@testing/Utils';

/* Modules */
import { UIModule } from '../../../ui/ui.module';


import { RealtimeComponent } from './realtime.component';

/* Components */
import { AssetsComponent } from '../../components/assets/assets.component';
import { AssetForecastComponent } from '../../components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from '../../components/asset-panel/asset-panel.component';
import { FlagstatesComponent } from '../../components/flagstates/flagstates.component';
import { MapSettingsComponent } from '../../components/map-settings/map-settings.component';
import { MapViewportsComponent } from '../../components/map-viewports/map-viewports.component';
import { TracksComponent } from '../../components/tracks/tracks.component';
import { TrackPanelComponent } from '../../components/track-panel/track-panel.component';

import { AssetReducer } from '@data/asset';
import { MapSettingsReducer } from '@data/map-settings';


describe('RealtimeComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        UIModule,
      ],
      declarations: [
        RealtimeComponent,
        AssetsComponent,
        AssetForecastComponent,
        AssetPanelComponent,
        FlagstatesComponent,
        MapSettingsComponent,
        MapViewportsComponent,
        TracksComponent,
        TrackPanelComponent
      ],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    })
    .compileComponents();
  }));


  function setup() {
    const fixture = TestBed.createComponent(RealtimeComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('mapStateToProps', () => {

    const testBoat = {
      microMove: {
        location: {
          longitude: 23.17178,
          latitude: 65.15318167666667
        },
        heading: 189,
        guid: "4eea28b6-0844-4a6b-f5be-6b655a4e0343",
        timestamp: "2019-05-02T09:04:58Z",
        speed: 11.2,
      },
      asset: "ba498d76-ecd1-486a-9302-728367b237a7",
      flagstate: "GBR",
      assetName: "Test boat"
    };

    const baseAssetTracks = {
      '6938453e-8ea7-4e55-b646-921b9c866e58': {
        tracks: [
          {
            location: {
              longitude: 11.642,
              latitude: 57.470666666666666
            },
            heading: 359,
            guid: 'e8d0109e-d6a8-4960-8af5-0506625a6e20',
            timestamp: '2019-04-10T10:57:52Z',
            speed: 7.900000095367432
          },
          {
            location: {
              longitude: 11.642,
              latitude: 57.469500000000004
            },
            heading: 359,
            guid: 'a8405e49-5132-4ea9-b40a-403ec431b4cf',
            timestamp: '2019-04-10T10:57:22Z',
            speed: 7.900000095367432
          },
          {
            location: {
              longitude: 11.642,
              latitude: 57.4685
            },
            heading: 359,
            guid: '01ca8272-417e-4ac4-a8b7-467c5567973c',
            timestamp: '2019-04-10T10:56:52Z',
            speed: 7.900000095367432
          },
          {
            location: {
              longitude: 11.642,
              latitude: 57.47166666666667
            },
            heading: 359,
            guid: '1fdb9ec2-882c-43e5-beea-b69263ab6da6',
            timestamp: '2019-04-10T10:58:20Z',
            speed: 7.800000190734863
          }
        ],
        assetId: '6938453e-8ea7-4e55-b646-921b9c866e58',
        visible: true,
        lineSegments: [
          {
            speed: 8,
            positions: [
              {
                longitude: 11.642,
                latitude: 57.470666666666666
              },
              {
                longitude: 11.642,
                latitude: 57.469500000000004
              },
              {
                longitude: 11.642,
                latitude: 57.4685
              },
              {
                longitude: 11.642,
                latitude: 57.47166666666667
              }
            ],
            color: '#0000FF'
          }
        ]
      }
    };

    it('should update assets when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      const currentState = { asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      expect(component["assets"]).not.toEqual([testBoat]);
      store.setState({
        ...currentState,
        asset: {
          ...currentState.asset,
          assets: {
            [testBoat.asset]: testBoat
          }
        }
      });
      expect(component["assets"]).toEqual([testBoat]);
    });

    it('should update mapSettings when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      const currentState = { asset: { assets: {}}, mapSettings: MapSettingsReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let mapSettings;
      const mapSettingsSubscription =
        component['mapSettings$'].subscribe(newMapSettings => mapSettings = newMapSettings);
      expect(mapSettings).toEqual(MapSettingsReducer.initialState);
      expect(mapSettings.flagsVisible).toBeFalsy();
      store.setState({
        ...currentState,
        mapSettings: {
          ...currentState.mapSettings,
          flagsVisible: true
        }
      });
      mapSettingsSubscription.unsubscribe();
      expect(mapSettings.flagsVisible).toBeTruthy();
    });

    it('should update selectedAsset when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      let currentState = { asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let selectedAsset;
      const selectedAssetSubscription =
        component['selectedAsset$'].subscribe(newSelectedAsset => selectedAsset = newSelectedAsset);
      expect(selectedAsset).toEqual({ fullAsset: undefined, assetTracks: undefined, currentPosition: undefined });
      currentState = { ...currentState, asset: {
        ...currentState.asset, selectedAsset: testBoat.asset, assets: { [testBoat.asset]: testBoat}
      } };
      store.setState(currentState);
      expect(selectedAsset).toEqual({ fullAsset: undefined, assetTracks: undefined, currentPosition: testBoat });
      selectedAssetSubscription.unsubscribe();
    });

    it('should update assetTracks when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      let currentState = { asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let assetTracks;
      const assetTracksSubscription = component['assetTracks$'].subscribe(newAssetTracks => assetTracks = newAssetTracks);
      expect(assetTracks).toEqual([]);
      currentState = { ...currentState, asset: {
        ...currentState.asset, assetTracks: baseAssetTracks
      } };
      store.setState(currentState);
      expect(assetTracks).toEqual([baseAssetTracks['6938453e-8ea7-4e55-b646-921b9c866e58']]);
      assetTracksSubscription.unsubscribe();
    });

    it('should update positionsForInspection when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      let currentState = { asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      const basePositionsForInspection = {
        '1': {
          location: {
            longitude: 17.976566666666667,
            latitude: 56.5789
          },
          heading: 55,
          guid: '47fc3ee8-dd32-41a9-a733-ffe2021fdaed',
          timestamp: '2019-03-31T05:48:30Z',
          speed: 19.5
        },
        '2': {
          location: {
            longitude: 18.029166666666665,
            latitude: 56.59851666666667
          },
          heading: 57,
          guid: '0152820f-33f0-4ee1-86a3-a2cd24d1e66c',
          timestamp: '2019-03-31T05:55:00Z',
          speed: 19.5
        }
      };

      let positionsForInspection;
      const positionsForInspectionSubscription =
        component['positionsForInspection$'].subscribe(newPositionsForInspection => positionsForInspection = newPositionsForInspection);
      expect(positionsForInspection).toEqual({});
      currentState = { ...currentState, asset: {
        ...currentState.asset, positionsForInspection: basePositionsForInspection
      } };
      store.setState(currentState);
      expect(positionsForInspection).toEqual(basePositionsForInspection);
      positionsForInspectionSubscription.unsubscribe();
    });

    it('should update forecasts when state is updated.', () => {
      const { component } = setup();
      const store = TestBed.get(Store);
      let currentState = { asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let forecasts;
      const forecastsSubscription = component['forecasts$'].subscribe(newForecasts => forecasts = newForecasts);
      expect(forecasts).toEqual({});
      currentState = { ...currentState, asset: {
        ...currentState.asset, forecasts: [testBoat.asset], assets: { [testBoat.asset]: testBoat }
      } };
      store.setState(currentState);
      expect(forecasts).toEqual({ [testBoat.asset]: testBoat });
      forecastsSubscription.unsubscribe();
    });

  });

});
