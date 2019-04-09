import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// For MDB Angular Free
import {
  NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
  InputsModule, IconsModule, DropdownModule
} from 'angular-bootstrap-md';


// Guards
import { AuthGuard } from './guards/auth.guard';

// Layouts
import { DefaultLayoutComponent } from './layouts/default/default.component';
import { LoginLayoutComponent } from './layouts/login/login.component';
import { FullLayoutComponent } from './layouts/full/full.component';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    /* MDB Imports: */
    NavbarModule, WavesModule, ButtonsModule, CheckboxModule,
    InputsModule, IconsModule, DropdownModule
  ],
  declarations: [
    DefaultLayoutComponent,
    LoginLayoutComponent,
    FullLayoutComponent,
    LoginComponent,
    UnauthorizedComponent,
  ],
  providers: [
    AuthGuard
  ]
})

export class CoreModule { }
