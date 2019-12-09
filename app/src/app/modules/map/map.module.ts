import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

/* Modules */
import { UIModule } from '../ui/ui.module';

/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';
import { ReportsComponent } from './pages/reports/reports.component';

/* Container-components */
import { MapLeftColumnComponent } from './container-components/map-left-column/map-left-column.component';
import { MapRightColumnComponent } from './container-components/map-right-column/map-right-column.component';

/* Components */
import { AssetGroupsComponent } from './components/asset-groups/asset-groups.component';
import { AssetFilterComponent } from './components/asset-filter/asset-filter.component';
import { AssetForecastComponent } from './components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { AssetSearchComponent } from './components/asset-search/asset-search.component';
import { AssetsComponent } from './components/assets/assets.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { IncidentComponent } from './components/incident/incident.component';
import { IncidentStatusFormComponent } from './components/incident-status-form/incident-status-form.component';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { MapLocationsComponent } from './components/map-locations/map-locations.component';
import { ManualMovementFormComponent } from './components/manual-movement-form/manual-movement-form.component';
import { NoteFormComponent } from './components/note-form/note-form.component';
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component';
import { PanelBlockComponent } from './components/panel-block/panel-block.component';
import { SavedFiltersComponent } from './components/saved-filters/saved-filters.component';
import { TopPanelComponent } from './components/top-panel/top-panel.component';
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
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSliderModule,
    RouterModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  declarations: [
    RealtimeComponent,
    ReportsComponent,
    AssetsComponent,
    AssetGroupsComponent,
    AssetFilterComponent,
    AssetForecastComponent,
    AssetPanelComponent,
    AssetSearchComponent,
    ControlPanelComponent,
    DistanceBetweenPointsComponent,
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
    NoteFormComponent,
    PeriodSelectorComponent,
    PanelBlockComponent,
    SavedFiltersComponent,
    TopPanelComponent,
    TracksComponent,
    TracksSegmentsComponent,
    TripPlayerComponent,
  ]
})

export class MapModule { }
