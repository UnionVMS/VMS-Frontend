import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CloseButtonComponent } from './components/button/close/close.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { LoadingDotsComponent } from './components/loading-dots/loading-dots.component';
import { ProgressCircleComponent } from './components/progress-circle/progress-circle.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';
import { TruncatedTextComponent } from './components/truncated-text/truncated-text.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    CloseButtonComponent,
    CountdownComponent,
    LoadingDotsComponent,
    ProgressCircleComponent,
    ToggleButtonComponent,
    TruncatedTextComponent,
  ],
  exports: [
    CloseButtonComponent,
    CountdownComponent,
    LoadingDotsComponent,
    ProgressCircleComponent,
    ToggleButtonComponent,
    TruncatedTextComponent,
  ]
})

export class UIModule { }
