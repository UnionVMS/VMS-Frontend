import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Modules */
import { RouterModule } from '@angular/router';
import { UIModule } from '../ui/ui.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';

import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DatetimePickerModule } from 'ngx-moment-tz-picker';

/* Pages */
import { AttachPageComponent } from './pages/attach/attach.component';
import { FormPageComponent } from './pages/form/form.component';
import { ShowByAssetPageComponent } from './pages/show-by-asset/show-by-asset.component';
import { SearchPageComponent } from './pages/search/search.component';

/* Components */
import { ArchiveDialogComponent } from './components/archive-dialog/archive-dialog.component';
import { DetachDialogComponent } from './components/detach-dialog/detach-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    DatetimePickerModule,
    RouterModule,
    UIModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTableModule,
  ],
  declarations: [
    AttachPageComponent,
    FormPageComponent,
    ShowByAssetPageComponent,
    SearchPageComponent,
    /* Components */
    ArchiveDialogComponent,
    DetachDialogComponent,
  ]
})

export class MobileTerminalModule { }
