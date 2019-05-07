import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/// Buttons
import { CloseButtonComponent } from './components/button/close/close.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    CloseButtonComponent,
    ToggleButtonComponent,
  ],
  exports: [
    CloseButtonComponent,
    ToggleButtonComponent,
  ]
})

export class UIModule { }
