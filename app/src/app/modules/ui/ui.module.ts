import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
/// Buttons
import { CloseButtonComponent } from './components/button/close/close.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';

@NgModule({
  imports: [
    CommonModule
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
