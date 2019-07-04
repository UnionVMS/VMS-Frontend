import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';

/* Modules */
import { UIModule } from '../ui/ui.module';


/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';

/* Components */
import { AssetsComponent } from './components/assets/assets.component';
import { AssetForecastComponent } from './components/asset-forecast/asset-forecast.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { AssetSearchComponent } from './components/asset-search/asset-search.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DistanceBetweenPointsComponent } from './components/distance-between-points/distance-between-points.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { LayerFilterComponent } from './components/layer-filter/layer-filter.component';
import { MapViewportsComponent } from './components/map-viewports/map-viewports.component';
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
  ],
  declarations: [
    RealtimeComponent,
    AssetsComponent,
    AssetForecastComponent,
    AssetPanelComponent,
    AssetSearchComponent,
    ControlPanelComponent,
    DistanceBetweenPointsComponent,
    FlagstatesComponent,
    InformationPanelComponent,
    LayerFilterComponent,
    MapViewportsComponent,
    TopPanelComponent,
    TracksComponent,
    TrackPanelComponent
  ]
})

export class MapModule { }
