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
import { FormPageComponent } from './pages/form/form.component';
import { SearchPageComponent } from './pages/search/search.component';
import { ShowPageComponent } from './pages/show/show.component';

/* Components */
import { ShowComponent } from './components/show/show.component';
import { ShowContactsComponent } from './components/show-contacts/show-contacts.component';
import { ShowMobileTerminalComponent } from './components/show-mobile-terminal/show-mobile-terminal.component';
import { ShowNotesComponent } from './components/show-notes/show-notes.component';


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
    FormPageComponent,
    SearchPageComponent,
    ShowPageComponent,
    ShowComponent,
    ShowContactsComponent,
    ShowMobileTerminalComponent,
    ShowNotesComponent
  ]
})

export class AssetModule { }
