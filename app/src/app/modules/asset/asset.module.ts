import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Modules */
import { UIModule } from '../ui/ui.module';

/* Pages */
import { ListComponent } from './pages/list/list.component';

/* Components */


@NgModule({
  imports: [
    CommonModule,
    UIModule,
  ],
  declarations: [
    ListComponent
  ]
})

export class AssetModule { }
