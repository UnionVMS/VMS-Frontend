import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Modules */
import { RouterModule } from '@angular/router';
import { UIModule } from '../ui/ui.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DatetimePickerModule } from 'ngx-moment-tz-picker';

/* Pages */
import { FormPageComponent } from './pages/form/form.component';
import { ShowByAssetPageComponent } from './pages/show-by-asset/show-by-asset.component';

/* Components */


@NgModule({
  imports: [
    CommonModule,
    DatetimePickerModule,
    RouterModule,
    UIModule,
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
    MatMomentDateModule
  ],
  declarations: [
    FormPageComponent,
    ShowByAssetPageComponent,
  ]
})

export class MobileTerminalModule { }
