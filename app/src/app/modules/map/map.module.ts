import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pages */
import { RealtimeComponent } from './pages/realtime/realtime.component';

/* Components */
import { AssetsComponent } from './components/assets/assets.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RealtimeComponent,
    AssetsComponent
  ],
  providers: [
  ]
})

export class MapModule { }
