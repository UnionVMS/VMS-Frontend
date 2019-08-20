import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/// Buttons
import { CloseButtonComponent } from './components/button/close/close.component';
import { ToggleButtonComponent } from './components/button/toggle/toggle.component';
import { LoadingDotsComponent } from './components/loading-dots/loading-dots.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { ColumnsButtonComponent } from './components/button/columns/columns.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    CloseButtonComponent,
    ToggleButtonComponent,
    LoadingDotsComponent,
    CountdownComponent,
    ColumnsButtonComponent,
  ],
  exports: [
    CloseButtonComponent,
    ToggleButtonComponent,
    LoadingDotsComponent,
    CountdownComponent,
    ColumnsButtonComponent,
  ]
})

export class UIModule { }
