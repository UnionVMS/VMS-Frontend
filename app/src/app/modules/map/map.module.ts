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
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { MapSettingsComponent } from './components/map-settings/map-settings.component';
import { MapViewportsComponent } from './components/map-viewports/map-viewports.component';
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
    FlagstatesComponent,
    MapSettingsComponent,
    MapViewportsComponent,
    TracksComponent,
    TrackPanelComponent
  ]
})

export class MapModule { }
