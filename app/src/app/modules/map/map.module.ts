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
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';

import { DatetimePickerModule } from 'ngx-moment-tz-picker';

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
import { AssetsComponent } from './components/assets/assets.component';
import { CoordinatesPopupComponent } from './components/coordinates-popup/coordinates-popup.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { EditAssetGroupDialogComponent } from './components/edit-asset-group-dialog/edit-asset-group-dialog.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { IncidentComponent } from './components/incident/incident.component';
import { IncidentCardComponent } from './components/incident-card/incident-card.component';
import { IncidentExpiryDateFormComponent } from './components/incident-expiry-date-form/incident-expiry-date-form.component';
import { IncidentLogComponent } from './components/incident-log/incident-log.component';
import { IncidentLogEntryNoteComponent } from './components/incident-log-entry-note/incident-log-entry-note.component';
import { IncidentLogEntryPollComponent } from './components/incident-log-entry-poll/incident-log-entry-poll.component';
import { IncidentLogEntryPositionComponent } from './components/incident-log-entry-position/incident-log-entry-position.component';
import { IncidentLogsComponent } from './components/incident-logs/incident-logs.component';
import { IncidentManualPollFormComponent } from './components/incident-manual-poll-form/incident-manual-poll-form.component';
import { IncidentStatusFormComponent } from './components/incident-status-form/incident-status-form.component';
import { IncidentTypeFormComponent } from './components/incident-type-form/incident-type-form.component';
import { IncidentsAssetNotSendingComponent } from './components/incidents-asset-not-sending/incidents-asset-not-sending.component';
import { IncidentsManualPositionModeComponent } from './components/incidents-manual-position-mode/incidents-manual-position-mode.component';
import { IncidentsOwnershipTransferComponent } from './components/incidents-ownership-transfer/incidents-ownership-transfer.component';
import { IncidentsParkedComponent } from './components/incidents-parked/incidents-parked.component';
import { IncidentsSeasonalFishingComponent } from './components/incidents-seasonal-fishing/incidents-seasonal-fishing.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { LicenceInformationComponent } from './components/licence-information/licence-information.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { MapLocationsComponent } from './components/map-locations/map-locations.component';
import { ManualMovementFormComponent } from './components/manual-movement-form/manual-movement-form.component';
import { ManualMovementFormDialogComponent } from './components/manual-movement-form-dialog/manual-movement-form-dialog.component';
import { ManualPollFormComponent } from './components/manual-poll-form/manual-poll-form.component';
import { NoteFormComponent } from './components/note-form/note-form.component';
import { PanelBlockComponent } from './components/panel-block/panel-block.component';
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component';
import { RightClickMenuComponent } from './components/right-click-menu/right-click-menu.component';
import { SavedFiltersComponent } from './components/saved-filters/saved-filters.component';
import { SourcePickerComponent } from './components/source-picker/source-picker.component';
import { SelectedAssetsPanelComponent } from './components/selected-assets-panel/selected-assets-panel.component';
import { TracksComponent } from './components/tracks/tracks.component';
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
    MatTabsModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSliderModule,
    RouterModule,
    DatetimePickerModule
  ],
  declarations: [
    RealtimeComponent,
    ReportsComponent,
    AddToAssetGroupDialogComponent,
    AssetsComponent,
    AssetGroupsComponent,
    AssetFilterComponent,
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
    CoordinatesPopupComponent,
    DistanceBetweenPointsComponent,
    EditAssetGroupDialogComponent,
    FlagstatesComponent,
    IncidentComponent,
    IncidentCardComponent,
    IncidentExpiryDateFormComponent,
    IncidentLogComponent,
    IncidentLogEntryNoteComponent,
    IncidentLogEntryPollComponent,
    IncidentLogEntryPositionComponent,
    IncidentLogsComponent,
    IncidentManualPollFormComponent,
    IncidentStatusFormComponent,
    IncidentTypeFormComponent,
    IncidentsAssetNotSendingComponent,
    IncidentsManualPositionModeComponent,
    IncidentsOwnershipTransferComponent,
    IncidentsParkedComponent,
    IncidentsSeasonalFishingComponent,
    InformationPanelComponent,
    LayerFilterComponent,
    LicenceInformationComponent,
    MapLocationsComponent,
    MapLayersComponent,
    MapLeftColumnComponent,
    MapRightColumnComponent,
    ManualMovementFormComponent,
    ManualMovementFormDialogComponent,
    ManualPollFormComponent,
    NoteFormComponent,
    PanelBlockComponent,
    PeriodSelectorComponent,
    RightClickMenuComponent,
    SavedFiltersComponent,
    SourcePickerComponent,
    SelectedAssetsPanelComponent,
    TracksComponent,
    TracksSegmentsComponent,
    TripPlayerComponent,
  ]
})

export class MapModule { }
