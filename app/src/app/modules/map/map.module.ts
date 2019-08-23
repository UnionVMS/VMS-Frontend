import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatCheckboxModule } from '@angular/material';

/* Modules */
import { UIModule } from '../ui/ui.module';


/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';

/* Components */
import { AreasComponent } from './components/areas/areas.component';
import { AssetsComponent } from './components/assets/assets.component';
import { AssetGroupsComponent } from './components/asset-groups/asset-groups.component';
import { AssetForecastComponent } from './components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { AssetSearchComponent } from './components/asset-search/asset-search.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { MapViewportsComponent } from './components/map-viewports/map-viewports.component';
import { SavedFiltersComponent } from './components/saved-filters/saved-filters.component';
import { TopPanelComponent } from './components/top-panel/top-panel.component';
import { TracksComponent } from './components/tracks/tracks.component';
import { TrackPanelComponent } from './components/track-panel/track-panel.component';

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
  ],
  declarations: [
    RealtimeComponent,
    AreasComponent,
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
    MapViewportsComponent,
    SavedFiltersComponent,
    TopPanelComponent,
    TracksComponent,
    TrackPanelComponent
  ]
})

export class MapModule { }
