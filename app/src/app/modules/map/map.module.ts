import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';

/* Components */
import { AssetsComponent } from './components/assets/assets.component';
import { AssetPanelComponent } from './components/asset-panel/asset-panel.component';
import { MapSettingsComponent } from './components/map-settings/map-settings.component';
import { TracksComponent } from './components/tracks/tracks.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RealtimeComponent,
    AssetsComponent,
    AssetPanelComponent,
    MapSettingsComponent,
    TracksComponent,
  ],
  providers: [
  ]
})

export class MapModule { }
