import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Modules */
import { UIModule } from '../ui/ui.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

/* Pages */
import { UserSettingsComponent } from './pages/user-settings/user-settings.component';

/* Components */


@NgModule({
  imports: [
    CommonModule,
    UIModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSlideToggleModule,
  ],
  declarations: [
    UserSettingsComponent
  ]
})

export class SettingsModule { }
