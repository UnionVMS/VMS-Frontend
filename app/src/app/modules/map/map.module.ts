import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';

/* Components */
import { AssetsComponent } from './components/assets/assets.component';
import { AssetDestinationsComponent } from './components/asset-destinations/asset-destinations.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { FlagstatesComponent } from './components/flagstates/flagstates.component';
import { MapSettingsComponent } from './components/map-settings/map-settings.component';
import { MapViewportsComponent } from './components/map-viewports/map-viewports.component';
import { TracksComponent } from './components/tracks/tracks.component';
import { TrackPanelComponent } from './components/track-panel/track-panel.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RealtimeComponent,
    AssetsComponent,
    AssetDestinationsComponent,
    AssetPanelComponent,
    FlagstatesComponent,
    MapSettingsComponent,
    MapViewportsComponent,
    TracksComponent,
    TrackPanelComponent
  ],
  providers: [
  ]
})

export class MapModule { }
