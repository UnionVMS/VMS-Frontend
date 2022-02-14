import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

/* Modules */
import { UIModule } from '../ui/ui.module';

/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';
import { ReportsComponent } from './pages/reports/reports.component';

/* Container-components */
import { MapLeftColumnComponent } from './container-components/map-left-column/map-left-column.component';
import { MapRightColumnComponent } from './container-components/map-right-column/map-right-column.component';

/* Components */
import { AddToAssetGroupDialogComponent } from './components/add-to-asset-group-dialog/add-to-asset-group-dialog.component';
import { AssetGroupsComponent } from './components/asset-groups/asset-groups.component';
import { AssetFilterComponent } from './components/asset-filter/asset-filter.component';
import { AssetFilterInformationPanelComponent } from './components/asset-filter-information-panel/asset-filter-information-panel.component';
import { AssetForecastComponent } from './components/asset-forecast/asset-forecast.component';
import { AssetIncidentsComponent } from './components/asset-incidents/asset-incidents.component';
import { AssetIncidentsDialogComponent } from './components/asset-incidents-dialog/asset-incidents-dialog.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { AssetPanelShowComponent } from './components/asset-panel-show/asset-panel-show.component';
import { AssetPositionsComponent } from './components/asset-positions/asset-positions.component';
import { AssetPollComponent } from './components/asset-poll/asset-poll.component';
import { AssetPollManualComponent } from './components/asset-poll-manual/asset-poll-manual.component';
import { AssetPollProgramComponent } from './components/asset-poll-program/asset-poll-program.component';
import { AssetSearchComponent } from './components/asset-search/asset-search.component';
import { AssetSearchInformationPanelComponent } from './components/asset-search-information-panel/asset-search-information-panel.component';
import { AssetsComponent } from './components/assets/assets.component';
import { CoordinatesPopupComponent } from './components/coordinates-popup/coordinates-popup.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { DistanceBetweenPointsPanelComponent } from './components/distance-between-points-panel/distance-between-points-panel.component';
import { EditAssetGroupDialogComponent } from './components/edit-asset-group-dialog/edit-asset-group-dialog.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { IncidentComponent } from './components/incident/incident/incident.component';
import { IncidentCardComponent } from './components/incident/incident-card/incident-card.component';
import { IncidentAttemptedContactDialogComponent } from './components/incident/incident-attempted-contact-dialog/incident-attempted-contact-dialog.component';
import { IncidentExpiryDateFormComponent } from './components/incident/incident-expiry-date-form/incident-expiry-date-form.component';
import { IncidentLogComponent } from './components/incident/incident-logs/incident-log/incident-log.component';
import { IncidentLogEntryExpiryDateComponent } from './components/incident/incident-logs/incident-log-entry/incident-log-entry-expiry-date/incident-log-entry-expiry-date.component';
import { IncidentLogEntryNoteComponent } from './components/incident/incident-logs/incident-log-entry/incident-log-entry-note/incident-log-entry-note.component';
import { IncidentLogEntryPollComponent } from './components/incident/incident-logs/incident-log-entry/incident-log-entry-poll/incident-log-entry-poll.component';
import { IncidentLogEntryPositionComponent } from './components/incident/incident-logs/incident-log-entry/incident-log-entry-position/incident-log-entry-position.component';
import { IncidentLogsComponent } from './components/incident/incident-logs/incident-logs/incident-logs.component';
import { IncidentManualPollFormComponent } from './components/incident/incident-manual-poll-form/incident-manual-poll-form.component';
import { IncidentResolveDialogComponent } from './components/incident/incident-resolve-dialog/incident-resolve-dialog.component';
import { IncidentStatusFormComponent } from './components/incident/incident-status-form/incident-status-form.component';
import { IncidentTypeFormDialogComponent } from './components/incident/incident-type-form-dialog/incident-type-form-dialog.component';
import { IncidentsAssetNotSendingComponent } from './components/incident/incidents-asset-not-sending/incidents-asset-not-sending.component';
import { IncidentsManualPositionModeComponent } from './components/incident/incidents-manual-position-mode/incidents-manual-position-mode.component';
import { IncidentsOwnershipTransferComponent } from './components/incident/incidents-ownership-transfer/incidents-ownership-transfer.component';
import { IncidentsParkedComponent } from './components/incident/incidents-parked/incidents-parked.component';
import { IncidentsSeasonalFishingComponent } from './components/incident/incidents-seasonal-fishing/incidents-seasonal-fishing.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { LicenceInformationComponent } from './components/licence-information/licence-information.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { MapLayersPanelComponent } from './components/map-layers-panel/map-layers-panel.component';
import { MapLocationsComponent } from './components/map-locations/map-locations.component';
import { MapLocationsPanelComponent } from './components/map-locations-panel/map-locations-panel.component';
import { MapStatisticsComponent } from './components/map-statistics/map-statistics.component';
import { ManualMovementFormComponent } from './components/manual-movement-form/manual-movement-form.component';
import { ManualMovementFormDialogComponent } from './components/manual-movement-form-dialog/manual-movement-form-dialog.component';
import { ManualMovementFormTooltipComponent } from './components/manual-movement-form-tooltip/manual-movement-form-tooltip.component';
import { ManualPollFormComponent } from './components/manual-poll-form/manual-poll-form.component';
import { NoteFormComponent } from './components/note-form/note-form.component';
import { PanelBlockComponent } from './components/panel-block/panel-block.component';
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component';
import { RightClickMenuComponent } from './components/right-click-menu/right-click-menu.component';
import { SavedFiltersComponent } from './components/saved-filters/saved-filters.component';
import { SourcePickerComponent } from './components/source-picker/source-picker.component';
import { SelectedAssetsPanelComponent } from './components/selected-assets-panel/selected-assets-panel.component';
import { TracksActivitiesComponent } from './components/tracks-activities/tracks-activities.component';
import { TracksComponent } from './components/tracks/tracks.component';
import { TracksPanelComponent } from './components/tracks-panel/tracks-panel.component';
import { TracksSegmentsComponent } from './components/tracks-segments/tracks-segments.component';
import { TripPlayerComponent } from './components/trip-player/trip-player.component';



@NgModule({
  imports: [
    CommonModule,
    UIModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSliderModule,
    MatTooltipModule,
    RouterModule,
    DragDropModule,
  ],
  declarations: [
    RealtimeComponent,
    ReportsComponent,
    AddToAssetGroupDialogComponent,
    AssetsComponent,
    AssetGroupsComponent,
    AssetFilterComponent,
    AssetFilterInformationPanelComponent,
    AssetForecastComponent,
    AssetIncidentsComponent,
    AssetIncidentsDialogComponent,
    AssetPanelComponent,
    AssetPanelShowComponent,
    AssetPositionsComponent,
    AssetPollComponent,
    AssetPollManualComponent,
    AssetPollProgramComponent,
    AssetSearchComponent,
    AssetSearchInformationPanelComponent,
    CoordinatesPopupComponent,
    DistanceBetweenPointsComponent,
    DistanceBetweenPointsPanelComponent,
    EditAssetGroupDialogComponent,
    FlagstatesComponent,
    IncidentComponent,
    IncidentCardComponent,
    IncidentAttemptedContactDialogComponent,
    IncidentExpiryDateFormComponent,
    IncidentLogComponent,
    IncidentLogEntryExpiryDateComponent,
    IncidentLogEntryNoteComponent,
    IncidentLogEntryPollComponent,
    IncidentLogEntryPositionComponent,
    IncidentLogsComponent,
    IncidentManualPollFormComponent,
    IncidentResolveDialogComponent,
    IncidentStatusFormComponent,
    IncidentTypeFormDialogComponent,
    IncidentsAssetNotSendingComponent,
    IncidentsManualPositionModeComponent,
    IncidentsOwnershipTransferComponent,
    IncidentsParkedComponent,
    IncidentsSeasonalFishingComponent,
    LayerFilterComponent,
    LicenceInformationComponent,
    MapLocationsComponent,
    MapLocationsPanelComponent,
    MapStatisticsComponent,
    MapLayersComponent,
    MapLayersPanelComponent,
    MapLeftColumnComponent,
    MapRightColumnComponent,
    ManualMovementFormComponent,
    ManualMovementFormDialogComponent,
    ManualMovementFormTooltipComponent,
    ManualPollFormComponent,
    NoteFormComponent,
    PanelBlockComponent,
    PeriodSelectorComponent,
    RightClickMenuComponent,
    SavedFiltersComponent,
    SourcePickerComponent,
    SelectedAssetsPanelComponent,
    TracksActivitiesComponent,
    TracksComponent,
    TracksPanelComponent,
    TracksSegmentsComponent,
    TripPlayerComponent,
  ]
})

export class MapModule { }
