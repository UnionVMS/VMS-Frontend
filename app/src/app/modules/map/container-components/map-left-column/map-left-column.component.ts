import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentInterfaces, IncidentSelectors } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { MapSavedFiltersActions, MapSavedFiltersInterfaces, MapSavedFiltersSelectors } from '@data/map-saved-filters';


@Component({
  selector: 'map-left-column',
  templateUrl: './map-left-column.component.html',
  styleUrls: ['./map-left-column.component.scss']
})
export class MapLeftColumnComponent implements OnInit, OnDestroy {

  @Input() centerMapOnPosition: (position: Position) => void;
  @Input() noWorkflow = false;

  public activePanel: string;
  public setActivePanel: (activeLeftPanel: string) => void;
  public setActiveRightPanel: (activeRightPanel: string) => void;

  public filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>;
  public setGivenFilterActive: (filterTypeName: string, status: boolean) => void;
  public filterAssets: (filterQuery: Array<AssetInterfaces.AssetFilterQuery>) => void;

  public assetEssentialsForAssetGroups: Readonly<{ readonly [assetId: string]: AssetInterfaces.AssetEssentialProperties }>;
  public currentFilterQuery$: Observable<ReadonlyArray<AssetInterfaces.AssetFilterQuery>>;
  public saveFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  public deleteFilter: (filterId: string) => void;
  public savedFilters$: Observable<ReadonlyArray<MapSavedFiltersInterfaces.SavedFilter>>;
  public activeFilters$: Observable<ReadonlyArray<string>>;
  public activateSavedFilter: (filterId: string) => void;
  public deactivateSavedFilter: (filterId: string) => void;

  public assetGroupFilters: ReadonlyArray<MapSavedFiltersInterfaces.SavedFilter>;
  public setAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;
  public clearAssetGroup: (assetGroup: AssetInterfaces.AssetGroup) => void;
  public clearSelectedAssets: () => void;
  public clearNotificationsForIncident: (incident: IncidentInterfaces.assetNotSendingIncident) => void;

  public searchAutocomplete: (searchQuery: string) => void;
  public searchAutocompleteResult$: Observable<ReadonlyArray<Readonly<{
    assetMovement: AssetInterfaces.AssetMovement,
    assetEssentials: AssetInterfaces.AssetEssentialProperties
  }>>>;
  public selectAsset: (assetId: string) => void;


  public assetNotSendingIncidents: ReadonlyArray<IncidentInterfaces.assetNotSendingIncident>;
  public incidentNotificationsByType: Readonly<{ readonly [type: string]: IncidentInterfaces.incidentNotificationsCollections }>;

  private unmount$: Subject<boolean> = new Subject<boolean>();

  public selectIncident: (incident: IncidentInterfaces.assetNotSendingIncident) => void;
  public countNotificationsOfType: (
    incidentNotifications: IncidentInterfaces.incidentNotificationsCollections,
    type: string
  ) => number;

  // Curried functions
  public setGivenFilterActiveCurry = (filterTypeName: string) => (status: boolean) => this.setGivenFilterActive(filterTypeName, status);
  public setGivenWorkflowActive = (filterTypeName: string) => (status: boolean) => {
    this.clearSelectedAssets();
    this.setGivenFilterActive(filterTypeName, status);
    this.store.dispatch(AssetActions.removeTracks());
  }

  constructor(private store: Store<any>) { }

  mapStateToProps() {
    this.store.select(MapSelectors.getActiveLeftPanel).pipe(takeUntil(this.unmount$)).subscribe((activePanel) => {
      this.activePanel = activePanel;
    });
    this.store.select(MapSelectors.getFiltersActive).pipe(takeUntil(this.unmount$)).subscribe((filtersActive) => {
      this.filtersActive = filtersActive;
    });
    this.currentFilterQuery$ = this.store.select(AssetSelectors.selectFilterQuery);
    this.savedFilters$ = this.store.select(MapSavedFiltersSelectors.getFilters);
    this.activeFilters$ = this.store.select(MapSavedFiltersSelectors.selectActiveFilters);
    this.store.select(MapSavedFiltersSelectors.getAssetGroupFilters).pipe(takeUntil(this.unmount$)).subscribe((assetGroupFilters) => {
      this.assetGroupFilters = assetGroupFilters;
      const assetIds = [ ...new Set(assetGroupFilters.reduce((acc: ReadonlyArray<string>, assetGroupFilter) => {
        const filter = assetGroupFilter.filter.find(f => f.type === 'GUID');
        return [ ...acc, ...filter.values ];
      }, []))];
      this.store.dispatch(AssetActions.checkForAssetEssentials({ assetIds }));
    });
    this.searchAutocompleteResult$ = this.store.select(AssetSelectors.getSearchAutocomplete);
    this.store.select(IncidentSelectors.getAssetNotSendingIncidents).pipe(takeUntil(this.unmount$)).subscribe(assetsNotSendingIncicents => {
      this.assetNotSendingIncidents = assetsNotSendingIncicents;
    });
    this.store.select(IncidentSelectors.getIncidentNotificationsByType).pipe(takeUntil(this.unmount$)).subscribe(
      incidentNotificationsByType => { this.incidentNotificationsByType = incidentNotificationsByType; }
    );
    this.store.select(AssetSelectors.getAssetEssentialsForAssetGroups)
      .pipe(takeUntil(this.unmount$))
      .subscribe((assetEssentials) => {
        this.assetEssentialsForAssetGroups = assetEssentials;
      });
  }

  mapDispatchToProps() {
    this.setActivePanel = (activeLeftPanel: string) => {
      if(activeLeftPanel === 'filters') {
        this.setActiveRightPanel('information');
      }
      this.store.dispatch(AssetActions.clearSelectedAssets());
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
      this.store.dispatch(AssetActions.removeTracks());
    };
    this.setGivenFilterActive = (filterTypeName: string, status: boolean) =>
      this.store.dispatch(MapActions.setGivenFilterActive({ filterTypeName, status }));
    this.filterAssets = (filterQuery: Array<AssetInterfaces.AssetFilterQuery>) => {
      return this.store.dispatch(AssetActions.setFilterQuery({filterQuery}));
    };
    this.saveFilter = (filter: MapSavedFiltersInterfaces.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.saveFilter({ filter }));
    this.deleteFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.deleteFilter({ filterId }));
    this.activateSavedFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.activateFilter({ filterId }));
    this.deactivateSavedFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.deactivateFilter({ filterId }));
    this.setAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(AssetActions.setAssetGroup({ assetGroup }));
    this.clearAssetGroup = (assetGroup: AssetInterfaces.AssetGroup) =>
      this.store.dispatch(AssetActions.clearAssetGroup({assetGroup}));
    this.searchAutocomplete = (searchQuery: string) =>
      this.store.dispatch(AssetActions.setAutocompleteQuery({searchQuery}));
    this.selectAsset = (assetId: string) =>
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
    this.setActiveRightPanel = (activeRightPanel: string) => {
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    };
    this.clearSelectedAssets = () =>
      this.store.dispatch(AssetActions.clearSelectedAssets());
    this.clearNotificationsForIncident = (incident: IncidentInterfaces.assetNotSendingIncident) =>
      this.store.dispatch(IncidentActions.clearNotificationsForIncident({ incident }));
  }

  mapFunctionsToProps() {
    this.selectIncident = (incident: IncidentInterfaces.assetNotSendingIncident) => {
      this.selectAsset(incident.assetId);
      this.clearNotificationsForIncident(incident);
      this.setActiveRightPanel('incident');
    };
    this.countNotificationsOfType = (
      incidentNotifications: IncidentInterfaces.incidentNotificationsCollections,
      type: string
    ) => {
      if(typeof incidentNotifications !== 'undefined') {
        return Object.values(incidentNotifications).reduce(
          (acc: number, incidentNotification: IncidentInterfaces.incidentNotifications) => {
            acc += incidentNotification[type];
            return acc;
          }, 0
        );
      }
      return 0;
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
    this.mapFunctionsToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  emptyClick() {
    return null;
  }
}
