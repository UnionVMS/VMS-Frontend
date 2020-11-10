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

import { MapRightColumnComponent } from './map-right-column.component';

import { AssetReducer, AssetActions, AssetTypes } from '@data/asset';
import AssetStub from '@data/asset/stubs/asset.stub';
import AssetMovementWithEssentialsStub from '@data/asset/stubs/assetMovementWithEssentials.stub';
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
        MapRightColumnComponent,
      ],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } },
        provideMockStore(),
      ]
    })
    .compileComponents();
  }));


  const setup = () => {
    const fixture = TestBed.createComponent(MapRightColumnComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  };

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  describe('mapDispatchToProps', () => {
    const mapDispatchToPropsSetup = () => {
      const { component } = setup();
      const store = TestBed.inject(MockStore);
      const dispatchSpy = spyOn(store, 'dispatch');
      component.mapDispatchToProps();
      return { component, dispatchSpy };
    };

    it('should dispatch MapSettingsActions.saveViewport when saveViewport is called.', () => {
      const { component, dispatchSpy } = mapDispatchToPropsSetup();

      const mapLocation = { name: 'Saved location #1', zoom: 10, center: [1.213, 12.321] };
      expect(dispatchSpy).toHaveBeenCalledTimes(0);
      component.saveMapLocation(1, mapLocation);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(MapSettingsActions.saveMapLocation({ key: 1, mapLocation, save: undefined }));
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
  });
});
