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
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { AssetSearchComponent } from './components/asset-search/asset-search.component';
import { AssetsComponent } from './components/assets/assets.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { CoordinatesPopupComponent } from './components/coordinates-popup/coordinates-popup.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { EditAssetGroupDialogComponent } from './components/edit-asset-group-dialog/edit-asset-group-dialog.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { IncidentComponent } from './components/incident/incident.component';
import { IncidentStatusFormComponent } from './components/incident-status-form/incident-status-form.component';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { MapLocationsComponent } from './components/map-locations/map-locations.component';
import { ManualMovementFormComponent } from './components/manual-movement-form/manual-movement-form.component';
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
    AssetPanelComponent,
    AssetSearchComponent,
    ControlPanelComponent,
    CoordinatesPopupComponent,
    DistanceBetweenPointsComponent,
    EditAssetGroupDialogComponent,
    FlagstatesComponent,
    IncidentComponent,
    IncidentStatusFormComponent,
    IncidentsComponent,
    InformationPanelComponent,
    LayerFilterComponent,
    MapLocationsComponent,
    MapLayersComponent,
    MapLeftColumnComponent,
    MapRightColumnComponent,
    ManualMovementFormComponent,
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
