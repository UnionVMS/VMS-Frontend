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

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import {MatButtonModule} from '@angular/material/button';

export class DatetimePickerModule { }
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
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
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})

export class UIModule { }
