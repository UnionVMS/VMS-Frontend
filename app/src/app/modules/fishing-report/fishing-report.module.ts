import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Modules */
import { RouterModule } from '@angular/router';
import { UIModule } from '../ui/ui.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';


/* Pages */
import { SearchPageComponent } from './pages/search/search.component';
import { ShowPageComponent } from './pages/show/show.component';

/* Components */
import { ShowComponent } from './components/show/show.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UIModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
  ],
  declarations: [
    SearchPageComponent,
    ShowPageComponent,
    ShowComponent,
  ]
})

export class FishingReportModule { }
