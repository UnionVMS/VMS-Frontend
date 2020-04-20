import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

// @ts-ignore
import moment from 'moment-timezone';

import { Store } from '@ngrx/store';
import { TestingModule } from '@src/testing/Utils';

import Map from 'ol/Map';

/* Modules */
import { UIModule } from '../../../ui/ui.module';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { RealtimeComponent } from './realtime.component';

/* Container-components */
import { MapLeftColumnComponent } from '../../container-components/map-left-column/map-left-column.component';
import { MapRightColumnComponent } from '../../container-components/map-right-column/map-right-column.component';

/* Components */
import { AssetsComponent } from '../../components/assets/assets.component';
import { AssetGroupsComponent } from '../../components/asset-groups/asset-groups.component'; // Not tested yet.
import { AssetForecastComponent } from '../../components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from '../../components/asset-panel/asset-panel.component';
import { AssetSearchComponent } from '../../components/asset-search/asset-search.component';
import { ControlPanelComponent } from '../../components/control-panel/control-panel.component'; // Not tested yet.
// Not tested yet.
import { DistanceBetweenPointsComponent } from '../../components/distance-between-points/distance-between-points.component';
import { FlagstatesComponent } from '../../components/flagstates/flagstates.component';
import { InformationPanelComponent } from '../../components/information-panel/information-panel.component';
import { LayerFilterComponent } from '../../components/layer-filter/layer-filter.component'; // Not tested yet.
import { MapLocationsComponent } from '../../components/map-locations/map-locations.component';
import { SavedFiltersComponent } from '../../components/saved-filters/saved-filters.component'; // Not tested yet.
import { TracksComponent } from '../../components/tracks/tracks.component';

import { AssetReducer, AssetActions } from '@data/asset';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';
import { IncidentReducer } from '@data/incident';
import { MapSettingsReducer, MapSettingsActions } from '@data/map-settings';
import { MapSavedFiltersReducer } from '@data/map-saved-filters';

import { formatDate } from '@app/helpers/helpers';

/* tslint:disable:no-string-literal */
describe('RealtimeComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        UIModule,
        FormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule
      ],
      declarations: [
        RealtimeComponent,
        AssetsComponent,
        AssetGroupsComponent,
        AssetForecastComponent,
        AssetPanelComponent,
        AssetSearchComponent,
        ControlPanelComponent,
        DistanceBetweenPointsComponent,
        FlagstatesComponent,
        InformationPanelComponent,
        LayerFilterComponent,
        MapLocationsComponent,
        MapLeftColumnComponent,
        MapRightColumnComponent,
        SavedFiltersComponent,
        TracksComponent,
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
    component.mapReady = true;
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('mapStateToProps', () => {

    function setupForMapStateToProps() {
      const setupObject = setup();
      return {
        ...setupObject,
        baseState: {
          mapSavedFilters: MapSavedFiltersReducer.initialState,
          map: { realtime: { ready: true } },
          incident: IncidentReducer.initialState,
          auth: { user: null }
        }
      };
    }

    it('should update assets when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      const currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();
      expect(component['assetMovements']).not.toEqual([AssetMovementWithEssentialsStub]);
      store.setState({
        ...currentState,
        asset: {
          ...currentState.asset,
          assetMovements: {
            [AssetMovementWithEssentialsStub.assetMovement.asset]: AssetMovementWithEssentialsStub.assetMovement
          },
          assetsEssentials: {
            [AssetMovementWithEssentialsStub.assetEssentials.assetId]: AssetMovementWithEssentialsStub.assetEssentials
          }
        }
      });
      expect(component['assetMovements']).toEqual([AssetMovementWithEssentialsStub]);
    });

    it('should update mapSettings when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      const currentState = {
        ...baseState,
        asset: { assetMovements: {}, filterQuery: [], selectedAssetGroups: [] },
        mapSettings: MapSettingsReducer.initialState
      };

      store.setState(currentState);
      component.mapStateToProps();

      expect(component.mapSettings).toEqual(MapSettingsReducer.initialState);
      expect(component.mapSettings.settings.flagsVisible).toBeFalsy();
      store.setState({
        ...currentState,
        mapSettings: {
          ...currentState.mapSettings,
          settings: {
            ...currentState.mapSettings.settings,
            flagsVisible: true
          }
        }
      });
      // mapSettingsSubscription.unsubscribe();
      expect(component.mapSettings.settings.flagsVisible).toBeTruthy();
    });

    it('should update mapSettings when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      const currentState = {
        ...baseState,
        asset: { assetMovements: {}, filterQuery: [], selectedAssetGroups: [] },
        mapSettings: MapSettingsReducer.initialState
      };

      store.setState(currentState);
      component.mapStateToProps();

      expect(component.mapSettings).toEqual(MapSettingsReducer.initialState);
      expect(component.mapSettings.settings.flagsVisible).toBeFalsy();
      store.setState({
        ...currentState,
        mapSettings: {
          ...currentState.mapSettings,
          settings: {
            ...currentState.mapSettings.settings,
            flagsVisible: true
          }
        }
      });
      // mapSettingsSubscription.unsubscribe();
      expect(component.mapSettings.settings.flagsVisible).toBeTruthy();
    });

    it('should update selectedAsset when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      let currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let selectedAssets;
      const selectedAssetSubscription = component.selectedAssets$.subscribe(newSelectedAssets => { selectedAssets = newSelectedAssets; });
      expect(selectedAssets).toEqual([]);
      currentState = { ...currentState, asset: {
        ...currentState.asset,
        selectedAsset: AssetMovementWithEssentialsStub.assetEssentials.assetId,
        selectedAssets: [AssetMovementWithEssentialsStub.assetEssentials.assetId],
        assets: { [AssetStub.id]: AssetStub },
        assetMovements: { [AssetMovementWithEssentialsStub.assetMovement.asset]: AssetMovementWithEssentialsStub.assetMovement }
      } };
      store.setState(currentState);
      expect(selectedAssets).toEqual(
        [{
          asset: AssetStub,
          assetTracks: undefined,
          currentPosition: AssetMovementWithEssentialsStub.assetMovement,
          currentlyShowing: true
        }]
      );
      selectedAssetSubscription.unsubscribe();
    });

    it('should update assetTracks when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      let currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let assetTracks;
      const assetTracksSubscription = component['assetTracks$'].subscribe(newAssetTracks => assetTracks = newAssetTracks);
      expect(assetTracks).toEqual([]);
      currentState = { ...currentState, asset: {
        ...currentState.asset, assetTracks: { [AssetTrackStub.assetId]: AssetTrackStub }
      } };
      store.setState(currentState);
      expect(assetTracks).toEqual([AssetTrackStub]);
      assetTracksSubscription.unsubscribe();
    });

    it('should update positionsForInspection when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      let currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      const basePositionsForInspection = {
        1: {
          location: {
            longitude: 17.976566666666667,
            latitude: 56.5789
          },
          heading: 55,
          guid: '47fc3ee8-dd32-41a9-a733-ffe2021fdaed',
          timestamp: 1554004110,
          speed: 19.5,
          source: 'AIS'
        },
        2: {
          location: {
            longitude: 18.029166666666665,
            latitude: 56.59851666666667
          },
          heading: 57,
          guid: '0152820f-33f0-4ee1-86a3-a2cd24d1e66c',
          timestamp: 1554004500,
          speed: 19.5,
          source: 'AIS'
        }
      };

      let positionsForInspection;
      const positionsForInspectionSubscription =
        component.positionsForInspection$.subscribe(newPositionsForInspection => positionsForInspection = newPositionsForInspection);
      expect(positionsForInspection).toEqual({});
      currentState = { ...currentState, asset: {
        ...currentState.asset, positionsForInspection: basePositionsForInspection
      } };
      store.setState(currentState);
      expect(positionsForInspection).toEqual(basePositionsForInspection);
      positionsForInspectionSubscription.unsubscribe();
    });

    it('should update forecasts when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.get(Store);
      let currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let forecasts;
      const forecastsSubscription = component['forecasts$'].subscribe(newForecasts => forecasts = newForecasts);
      expect(forecasts).toEqual({});
      currentState = { ...currentState, asset: {
        ...currentState.asset,
        forecasts: [AssetMovementWithEssentialsStub.assetEssentials.assetId],
        assetMovements: { [AssetMovementWithEssentialsStub.assetMovement.asset]: AssetMovementWithEssentialsStub.assetMovement }
      } };
      store.setState(currentState);
      expect(forecasts).toEqual(
        { [AssetMovementWithEssentialsStub.assetMovement.asset]: AssetMovementWithEssentialsStub.assetMovement }
      );
      forecastsSubscription.unsubscribe();
    });

  });

  describe('mapDispatchToProps', () => {
    function mapDispatchToPropsSetup() {
      const { component } = setup();
      const store = TestBed.get(Store);
      const dispatchSpy = spyOn(store, 'dispatch');
      component.mapDispatchToProps();
      return { component, dispatchSpy };
    }

    it('should dispatch MapSettingsActions.saveViewport when saveViewport is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      const mapLocation = { zoom: 10, center: [1.213, 12.321] };
      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.saveMapLocation(1, mapLocation);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.saveMapLocation({key: 1, mapLocation}));
    });

    it('should dispatch MapSettingsActions.setVisibilityForAssetNames when setVisibilityForAssetNames is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.setVisibilityForAssetNames(true);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.setVisibilityForAssetNames({ visibility: true }));
    });

    it('should dispatch MapSettingsActions.setVisibilityForAssetSpeeds when setVisibilityForAssetSpeeds is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.setVisibilityForAssetSpeeds(true);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.setVisibilityForAssetSpeeds({ visibility: true }));
    });

    it('should dispatch MapSettingsActions.setVisibilityForTracks when setVisibilityForTracks is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.setVisibilityForTracks(true);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.setVisibilityForTracks({ visibility: true }));
    });

    it('should dispatch MapSettingsActions.SetVisibilityForFlags when setVisibilityForFlags is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.setVisibilityForFlags(true);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.setVisibilityForFlags({ visibility: true }));
    });

    it('should dispatch MapSettingsActions.setVisibilityForForecast when setVisibilityForForecast is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.setVisibilityForForecast(true);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.setVisibilityForForecast({ visibility: true }));
    });

    it('should dispatch AssetActions.selectAsset when selectAsset is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component['selectAsset']('asset-id');

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.selectAsset({ assetId: 'asset-id' })
      );
    });

    it('should dispatch AssetActions.getAssetTrack when getAssetTrack is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component['getAssetTrack']('asset-id', 'movement-guid');

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.getAssetTrack({ assetId: 'asset-id', movementGuid: 'movement-guid' })
      );
    });

    it('should dispatch AssetActions.untrackAsset when untrackAsset is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component['untrackAsset']('asset-id');

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.untrackAsset({ assetId: 'asset-id' })
      );
    });

    it('should dispatch AssetActions.removeForecast when removeForecast is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component['removeForecast']('asset-id');

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.removeForecast({ assetId: 'asset-id' })
      );
    });
  });

  describe('Initialization', () => {
    function initializationSetup() {
      const { component } = setup();
      const store = TestBed.get(Store);
      const currentState = {
        asset: AssetReducer.initialState,
        mapSettings: MapSettingsReducer.initialState,
        mapSavedFilters: MapSavedFiltersReducer.initialState,
        map: { realtime: { ready: true }, mapSettingsLoaded: true },
        incident: IncidentReducer.initialState,
        auth: { user: null },
      };
      store.setState(currentState);
      component.ngOnInit();
      component.setupMap();
      return { component, store, currentState };
    }

    it('should initialize a map and respond to move events', () => {
      const { component } = initializationSetup();

      expect(component['mapZoom']).toEqual(10);

      component.map.getView().setZoom(2);
      expect(component['mapZoom']).toEqual(10);
      component.map.dispatchEvent({
        type: 'moveend'
      });
      expect(component['mapZoom']).toEqual(2);
    });

    it('should mount and unmount selection functions', () => {
      const { component } = initializationSetup();

      let run = 0;
      component.registerOnSelectFunction('test', (event) => {
        run += 1;
      });
      component['selection'].dispatchEvent({
        type: 'select',
        selected: [],
        deselected: []
      });

      expect(run).toEqual(1);
      component['unregisterOnSelectFunction']('test');
      component['selection'].dispatchEvent({
        type: 'select',
        selected: [],
        deselected: []
      });
      expect(run).toEqual(1);
    });

    it('should mount and unmount click functions', () => {
      const { component } = initializationSetup();

      let run = 0;
      component.registerOnClickFunction('test', (event) => {
        run += 1;
      });

      component['map'].dispatchEvent({ type: 'click' });
      expect(run).toEqual(1);

      component['unregisterOnClickFunction']('test');
      component['map'].dispatchEvent({ type: 'click' });
      expect(run).toEqual(1);
    });

  });

});
