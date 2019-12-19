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

  public currentFilterQuery$: Observable<ReadonlyArray<AssetInterfaces.AssetFilterQuery>>;
  public addSavedFilter: (filter: MapSavedFiltersInterfaces.SavedFilter) => void;
  public savedFilters$: Observable<Readonly<{ readonly [filterName: string]: ReadonlyArray<AssetInterfaces.AssetFilterQuery> }>>;
  public activeFilterNames$: Observable<ReadonlyArray<string>>;
  public activateSavedFilter: (filterName: string) => void;
  public deactivateSavedFilter: (filterName: string) => void;

  public assetGroups$: Observable<ReadonlyArray<AssetInterfaces.AssetGroup>>;
  public selectedAssetGroups$: Observable<ReadonlyArray<AssetInterfaces.AssetGroup>>;
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
    type: IncidentInterfaces.incidentNotificationTypes.created | IncidentInterfaces.incidentNotificationTypes.updated
  ) => number;

  // Curried functions
  public setGivenFilterActiveCurry = (filterTypeName: string) => (status: boolean) => this.setGivenFilterActive(filterTypeName, status);
  public setGivenWorkflowActive = (filterTypeName: string) => (status: boolean) => {
    this.clearSelectedAssets();
    this.setGivenFilterActive(filterTypeName, status);
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
    this.savedFilters$ = this.store.select(MapSavedFiltersSelectors.getSavedFilters);
    this.activeFilterNames$ = this.store.select(MapSavedFiltersSelectors.selectActiveFilters);
    this.assetGroups$ = this.store.select(AssetSelectors.getAssetGroups);
    this.selectedAssetGroups$ = this.store.select(AssetSelectors.getSelectedAssetGroups);
    this.searchAutocompleteResult$ = this.store.select(AssetSelectors.getSearchAutocomplete);
    this.store.select(IncidentSelectors.getAssetNotSendingIncidents).pipe(takeUntil(this.unmount$)).subscribe(assetsNotSendingIncicents => {
      this.assetNotSendingIncidents = assetsNotSendingIncicents;
    });
    this.store.select(IncidentSelectors.getIncidentNotificationsByType).pipe(takeUntil(this.unmount$)).subscribe(
      incidentNotificationsByType => { this.incidentNotificationsByType = incidentNotificationsByType; }
    );
  }

  mapDispatchToProps() {
    this.setActivePanel = (activeLeftPanel: string) => {
      if(activeLeftPanel === 'filters') {
        this.setActiveRightPanel('information');
      }
      this.store.dispatch(AssetActions.clearSelectedAssets());
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
    };
    this.setGivenFilterActive = (filterTypeName: string, status: boolean) =>
      this.store.dispatch(MapActions.setGivenFilterActive({ filterTypeName, status }));
    this.filterAssets = (filterQuery: Array<AssetInterfaces.AssetFilterQuery>) => {
      return this.store.dispatch(AssetActions.setFilterQuery({filterQuery}));
    };
    this.addSavedFilter = (filter: MapSavedFiltersInterfaces.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.addSavedFilter({ filter }));
    this.activateSavedFilter = (filterName: string) =>
      this.store.dispatch(MapSavedFiltersActions.activateFilter({ filterName }));
    this.deactivateSavedFilter = (filterName: string) =>
      this.store.dispatch(MapSavedFiltersActions.deactivateFilter({ filterName }));
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
      type: IncidentInterfaces.incidentNotificationTypes.created | IncidentInterfaces.incidentNotificationTypes.updated
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
