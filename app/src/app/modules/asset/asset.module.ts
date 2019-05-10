import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Modules */
import { UIModule } from '../ui/ui.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


/* Pages */
import { ListComponent } from './pages/list/list.component';

/* Components */



@NgModule({
  imports: [
    CommonModule,
    UIModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    ListComponent
  ]
})

export class AssetModule { }
