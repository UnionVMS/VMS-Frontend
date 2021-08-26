import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AssetActions, AssetTypes, AssetSelectors } from '@data/asset';
import { IncidentActions, IncidentTypes, IncidentSelectors } from '@data/incident';
import { MapActions, MapSelectors } from '@data/map';
import { MapSavedFiltersActions, MapSavedFiltersTypes, MapSavedFiltersSelectors } from '@data/map-saved-filters';
import { UserSettingsSelectors } from '@data/user-settings';
import { MapSettingsSelectors, MapSettingsTypes } from '@data/map-settings';
import { Position } from '@data/generic.types';


@Component({
  selector: 'map-left-column',
  templateUrl: './map-left-column.component.html',
  styleUrls: ['./map-left-column.component.scss']
})
export class MapLeftColumnComponent implements OnInit, OnDestroy {

  @Input() centerMapOnPosition: (position: Position) => void;
  @Input() noWorkflow = false;
  @Input() columnHidden: boolean;
  @Input() hideLeftColumn: (hidden: boolean) => void;

  public activePanel: ReadonlyArray<string>;
  public setActivePanel: (activeLeftPanel: ReadonlyArray<string>) => void;
  public setActiveRightPanel: (activeRightPanel: ReadonlyArray<string>) => void;
  public setActiveInformationPanel: (activeInformationPanel: string | null) => void;

  public filtersActive: Readonly<{ readonly [filterTypeName: string]: boolean }>;
  public setGivenFilterActive: (filterTypeName: string, status: boolean) => void;
  public filterAssets: (filterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>) => void;

  public assetForAssetGroups: Readonly<{ readonly [assetId: string]: AssetTypes.Asset }>;
  public currentFilterQuery$: Observable<ReadonlyArray<AssetTypes.AssetFilterQuery>>;
  public saveFilter: (filter: MapSavedFiltersTypes.SavedFilter) => void;
  public deleteFilter: (filterId: string) => void;
  public savedFilters$: Observable<ReadonlyArray<MapSavedFiltersTypes.SavedFilter>>;
  public activeFilters$: Observable<ReadonlyArray<string>>;
  public activateSavedFilter: (filterId: string) => void;
  public deactivateSavedFilter: (filterId: string) => void;

  public assetGroupFilters: ReadonlyArray<MapSavedFiltersTypes.SavedFilter>;
  public setAssetGroup: (assetGroup: AssetTypes.AssetGroup) => void;
  public clearAssetGroup: (assetGroup: AssetTypes.AssetGroup) => void;
  public clearSelectedAssets: () => void;
  public clearNotificationsForIncident: (incident: IncidentTypes.Incident) => void;
  public clearSelectedIncident: () => void;

  public searchAutocomplete: (searchQuery: string) => void;
  public searchAutocompleteResult$: Observable<ReadonlyArray<Readonly<{
    assetMovement: AssetTypes.AssetMovement,
    asset: AssetTypes.Asset
  }>>>;
  public selectAsset: (assetId: string) => void;
  public userTimezone$: Observable<string>;
  public mapSettings: MapSettingsTypes.Settings;


  public incidentsByTypeAndStatus: IncidentTypes.IncidentsByTypeAndStatus;

  private readonly unmount$: Subject<boolean> = new Subject<boolean>();

  public selectedIncident: Readonly<IncidentTypes.Incident>;
  public dispatchSelectIncident: (incidentId: number) => void;
  public selectIncident: (incident: IncidentTypes.Incident) => void;
  public countNotificationsOfType: (
    incidentNotifications: IncidentTypes.IncidentNotificationsCollections,
    type: string
  ) => number;

  // Curried functions
  public setGivenFilterActiveCurry = (filterTypeName: string) => (status: boolean) => this.setGivenFilterActive(filterTypeName, status);
  public toggleLastInPanelTree = (panelTree: ReadonlyArray<string>) => (status: boolean) => {
    if(status) {
      this.setActivePanelAndShowColumn(panelTree);
    } else {
      const panelTreeMutation = [ ...panelTree ];
      panelTreeMutation.pop();
      if(panelTreeMutation.length <= 1) {
        this.setActiveRightPanel(['information']);
        this.clearSelectedIncident();
      }
      this.setActivePanelAndShowColumn(panelTreeMutation);
    }
  }

  public setActivePanelAndShowColumn = (activeLeftPanel: ReadonlyArray<string>) => {
    if(this.columnHidden) {
      this.hideLeftColumn(false);
    }
    this.setActivePanel(activeLeftPanel);
  }

  constructor(private readonly store: Store<any>) { }

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
      this.store.dispatch(AssetActions.checkForAssets({ assetIds }));
    });
    this.searchAutocompleteResult$ = this.store.select(AssetSelectors.getSearchAutocomplete);
    this.store.select(IncidentSelectors.getIncidentsByTypeAndStatus).pipe(takeUntil(this.unmount$)).subscribe(
      (incidentsByTypeAndStatus: IncidentTypes.IncidentsByTypeAndStatus) => {
        this.incidentsByTypeAndStatus = incidentsByTypeAndStatus;
    });
    this.store.select(IncidentSelectors.getSelectedIncident).pipe(takeUntil(this.unmount$)).subscribe(
      incident => { this.selectedIncident = incident; }
    );
    this.store.select(AssetSelectors.getAssetsForAssetGroups)
      .pipe(takeUntil(this.unmount$))
      .subscribe((asset) => {
        this.assetForAssetGroups = asset;
      });
    this.store.select(MapSettingsSelectors.getMapSettings).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
    this.userTimezone$ = this.store.select(UserSettingsSelectors.getTimezone);
  }

  mapDispatchToProps() {
    this.setActivePanel = (activeLeftPanel: ReadonlyArray<string>) => {
      if(activeLeftPanel[0] === 'filters') {
        this.setActiveRightPanel(['information']);
      }
      this.store.dispatch(AssetActions.clearSelectedAssets());
      this.store.dispatch(MapActions.setActiveLeftPanel({ activeLeftPanel }));
      this.store.dispatch(AssetActions.removeTracks());
    };
    this.setActiveInformationPanel = (activeInformationPanel: string | null) => {
      if(this.mapSettings.autoHelp === true) {
        this.store.dispatch(MapActions.setActiveInformationPanel({ activeInformationPanel }));
      }
    };
    this.setGivenFilterActive = (filterTypeName: string, status: boolean) =>
      this.store.dispatch(MapActions.setGivenFilterActive({ filterTypeName, status }));
    this.filterAssets = (filterQuery: ReadonlyArray<AssetTypes.AssetFilterQuery>) =>
      this.store.dispatch(AssetActions.setFilterQuery({filterQuery}));
    this.saveFilter = (filter: MapSavedFiltersTypes.SavedFilter) =>
      this.store.dispatch(MapSavedFiltersActions.saveFilter({ filter }));
    this.deleteFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.deleteFilter({ filterId }));
    this.activateSavedFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.activateFilter({ filterId }));
    this.deactivateSavedFilter = (filterId: string) =>
      this.store.dispatch(MapSavedFiltersActions.deactivateFilter({ filterId }));
    this.setAssetGroup = (assetGroup: AssetTypes.AssetGroup) =>
      this.store.dispatch(AssetActions.setAssetGroup({ assetGroup }));
    this.clearAssetGroup = (assetGroup: AssetTypes.AssetGroup) =>
      this.store.dispatch(AssetActions.clearAssetGroup({assetGroup}));
    this.searchAutocomplete = (searchQuery: string) =>
      this.store.dispatch(AssetActions.setAutocompleteQuery({searchQuery}));
    this.selectAsset = (assetId: string) => {
      this.store.dispatch(AssetActions.selectAsset({ assetId }));
      this.store.dispatch(AssetActions.getLastPositionsForSelectedAsset({ assetId }));
    };
    this.dispatchSelectIncident = (incidentId: number) =>
      this.store.dispatch(IncidentActions.selectIncident({ incidentId }));
    this.setActiveRightPanel = (activeRightPanel: ReadonlyArray<string>) => {
      this.store.dispatch(MapActions.setActiveRightPanel({ activeRightPanel }));
    };
    this.clearSelectedAssets = () =>
      this.store.dispatch(AssetActions.clearSelectedAssets());
    this.clearNotificationsForIncident = (incident: IncidentTypes.Incident) =>
      this.store.dispatch(IncidentActions.clearNotificationsForIncident({ incident }));
    this.clearSelectedIncident = () => this.store.dispatch(IncidentActions.clearSelectedIncident());
  }

  mapFunctionsToProps() {
    this.selectIncident = (incident: IncidentTypes.Incident) => {
      this.selectAsset(incident.assetId);
      this.dispatchSelectIncident(incident.id);
      this.clearNotificationsForIncident(incident);
      this.setActiveRightPanel(['incident']);
      this.centerMapOnPosition(incident.lastKnownLocation.location);
    };
    this.countNotificationsOfType = (
      incidentNotifications: IncidentTypes.IncidentNotificationsCollections,
      type: string
    ) => {
      if(typeof incidentNotifications !== 'undefined') {
        return Object.values(incidentNotifications).reduce(
          (acc: number, incidentNotification: IncidentTypes.IncidentNotifications) => {
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
