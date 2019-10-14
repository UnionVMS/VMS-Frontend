import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CloseButtonComponent } from './components/button/close/close.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';
import { LoadingDotsComponent } from './components/loading-dots/loading-dots.component';
import { CountdownComponent } from './components/countdown/countdown.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule
  ],
  declarations: [
    CloseButtonComponent,
    ToggleButtonComponent,
    LoadingDotsComponent,
    CountdownComponent,
  ],
  exports: [
    CloseButtonComponent,
    ToggleButtonComponent,
    LoadingDotsComponent,
    CountdownComponent,
  ]
})

export class UIModule { }
