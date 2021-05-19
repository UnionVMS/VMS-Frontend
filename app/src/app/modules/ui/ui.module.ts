import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

import { CloseButtonComponent } from './components/button/close/close.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { CountdownCircleComponent } from './components/countdown-circle/countdown-circle.component';
import { LoadingDotsComponent } from './components/loading-dots/loading-dots.component';
import { ProgressCircleComponent } from './components/progress-circle/progress-circle.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';
import { TruncatedTextComponent } from './components/truncated-text/truncated-text.component';
import { DatetimePickerComponent } from './components/datetime-picker/datetime-picker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule
  ],
  declarations: [
    CloseButtonComponent,
    CountdownComponent,
    CountdownCircleComponent,
    LoadingDotsComponent,
    ProgressCircleComponent,
    ToggleButtonComponent,
    TruncatedTextComponent,
    DatetimePickerComponent,
  ],
  exports: [
    CloseButtonComponent,
    CountdownComponent,
    CountdownCircleComponent,
    LoadingDotsComponent,
    ProgressCircleComponent,
    ToggleButtonComponent,
    TruncatedTextComponent,
    DatetimePickerComponent,
  ]
})

export class UIModule { }
