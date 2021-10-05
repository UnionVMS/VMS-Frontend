import { waitForAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

// @ts-ignore
import moment from 'moment-timezone';

import { provideMockStore, MockStore } from '@ngrx/store/testing';

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
// Not tested yet.
import { DistanceBetweenPointsComponent } from '../../components/distance-between-points/distance-between-points.component';
import { FlagstatesComponent } from '../../components/flagstates/flagstates.component';
import { LayerFilterComponent } from '../../components/layer-filter/layer-filter.component'; // Not tested yet.
import { MapLocationsComponent } from '../../components/map-locations/map-locations.component';
import { SavedFiltersComponent } from '../../components/saved-filters/saved-filters.component'; // Not tested yet.
import { TracksComponent } from '../../components/tracks/tracks.component';

import { AssetReducer, AssetActions, AssetTypes } from '@data/asset';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetMovementWithAssetStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
import AssetTrackStub from '@data/asset/stubs/assetTracks.stub';
import { IncidentReducer } from '@data/incident';
import { MapActions, MapReducer } from '@data/map';
import { MapSettingsReducer, MapSettingsActions } from '@data/map-settings';
import { MapSavedFiltersReducer } from '@data/map-saved-filters';

import { formatDate } from '@app/helpers/helpers';

/* tslint:disable:no-string-literal */
describe('RealtimeComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
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
        DistanceBetweenPointsComponent,
        FlagstatesComponent,
        LayerFilterComponent,
        MapLocationsComponent,
        MapLeftColumnComponent,
        MapRightColumnComponent,
        SavedFiltersComponent,
        TracksComponent,
      ],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } },
        provideMockStore(),
      ]
    })
    .compileComponents();
  }));


  const setup = () => {
    const fixture = TestBed.createComponent(RealtimeComponent);
    const component = fixture.componentInstance;
    component.mapReady = true;
    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('mapStateToProps', () => {

    const setupForMapStateToProps = () => {
      const setupObject = setup();
      return {
        ...setupObject,
        baseState: {
          mapSavedFilters: MapSavedFiltersReducer.initialState,
          map: { ...MapReducer.initialState, realtime: { ready: true } },
          incident: IncidentReducer.initialState,
          auth: { user: null },
          asset: { ...AssetReducer.initialState }
        }
      };
    };

    it('should update assets when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      const currentState = { ...baseState };

      store.setState(currentState);
      component.mapStateToProps();
      expect(component['assetMovements']).not.toEqual([AssetMovementWithAssetStub]);
      store.setState({
        ...currentState,
        asset: {
          ...currentState.asset,
          assetMovements: {
            [AssetMovementWithAssetStub.assetMovement.asset]: AssetMovementWithAssetStub.assetMovement
          },
          assets: {
            [AssetMovementWithAssetStub.asset.id]: AssetMovementWithAssetStub.asset
          }
        }
      });
      expect(component['assetMovements']).toEqual([AssetMovementWithAssetStub]);
    });

    it('should update mapSettings when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      const currentState = {
        ...baseState,
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

      expect(component.mapSettings.settings.flagsVisible).toBeTruthy();
    });

    it('should update mapSettings when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      const currentState = {
        ...baseState,
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

      expect(component.mapSettings.settings.flagsVisible).toBeTruthy();
    });

    it('should update selectedAsset when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      let currentState = { ...baseState };

      store.setState(currentState);
      component.mapStateToProps();

      expect(component.selectedAssets).toEqual([]);
      currentState = { ...currentState, asset: {
        ...currentState.asset,
        selectedAsset: AssetMovementWithAssetStub.asset.id,
        selectedAssets: [AssetMovementWithAssetStub.asset.id],
        assets: { [AssetStub.id]: AssetStub },
        assetMovements: { [AssetMovementWithAssetStub.assetMovement.asset]: AssetMovementWithAssetStub.assetMovement }
      } };
      store.setState(currentState);
      expect(component.selectedAssets).toEqual(
        [{
          asset: AssetStub,
          assetTracks: undefined,
          currentPosition: AssetMovementWithAssetStub.assetMovement,
          currentlyShowing: true
        } as AssetTypes.AssetData]
      );
    });

    it('should update assetTracks when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      let currentState = { ...baseState };

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

    it('should update forecasts when state is updated.', () => {
      const { component, baseState } = setupForMapStateToProps();
      const store = TestBed.inject(MockStore);
      let currentState = { ...baseState, asset: AssetReducer.initialState };

      store.setState(currentState);
      component.mapStateToProps();

      let forecasts;
      const forecastsSubscription = component['forecasts$'].subscribe(newForecasts => forecasts = newForecasts);
      expect(forecasts).toEqual({});
      currentState = { ...currentState, asset: {
        ...currentState.asset,
        forecasts: [AssetMovementWithAssetStub.asset.id],
        assetMovements: { [AssetMovementWithAssetStub.assetMovement.asset]: AssetMovementWithAssetStub.assetMovement }
      } };
      store.setState(currentState);
      expect(forecasts).toEqual(
        { [AssetMovementWithAssetStub.assetMovement.asset]: AssetMovementWithAssetStub.assetMovement }
      );
      forecastsSubscription.unsubscribe();
    });

  });

  describe('mapDispatchToProps', () => {
    const mapDispatchToPropsSetup = () => {
      const { component } = setup();
      const store = TestBed.inject(MockStore);
      const dispatchSpy = spyOn(store, 'dispatch');
      component.mapDispatchToProps();
      return { component, dispatchSpy };
    };

    it('should dispatch AssetActions.selectAsset when selectAsset is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();
      component.selectedAssets = [];
      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.activeLeftPanel = ['filters'];
      component['selectAsset']('asset-id');

      expect(dispatchSpy).toHaveBeenCalledTimes(3);
      expect(dispatchSpy).toHaveBeenCalledWith(
        MapActions.setActiveRightPanel({ activeRightPanel: ['showAsset'] })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.selectAsset({ assetId: 'asset-id' })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        AssetActions.getLastPositionsForSelectedAsset({ assetId: 'asset-id' })
      );
    });
  });

  describe('Initialization', () => {
    const initializationSetup = () => {
      const { component } = setup();
      const store = TestBed.inject(MockStore);
      const currentState = {
        asset: AssetReducer.initialState,
        mapSettings: MapSettingsReducer.initialState,
        mapSavedFilters: MapSavedFiltersReducer.initialState,
        map: { ...MapReducer.initialState, realtime: { ready: true }, mapSettingsLoaded: true },
        incident: IncidentReducer.initialState,
        auth: { user: null },
      };
      store.setState(currentState);
      component.ngOnInit();
      component.setupMap();
      return { component, store, currentState };
    };

    it('should initialize a map and respond to move events', () => {
      const { component } = initializationSetup();

      expect(component['mapZoom']).toEqual(6);

      component.map.getView().setZoom(2);
      expect(component['mapZoom']).toEqual(6);
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
