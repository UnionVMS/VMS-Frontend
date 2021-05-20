import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';


import { UIModule } from '@modules/ui/ui.module';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { FishingGuard } from './guards/fishing.guard';

// Layouts
import { AssetLayoutComponent } from './layouts/asset/asset.component';
import { DefaultLayoutComponent } from './layouts/default/default.component';
import { FullLayoutComponent } from './layouts/full/full.component';
import { LoginLayoutComponent } from './layouts/login/login.component';
import { MobileTerminalLayoutComponent } from './layouts/mobile-terminal/mobile-terminal.component';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/404/404.component';

// Components
import { LoggedOutDialogComponent } from './components/logged-out-dialog/logged-out-dialog.component';
import { LogoutTimerComponent } from './components/logout-timer/logout-timer.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { TypescriptTranslationsComponent } from './components/typescript-translations/typescript-translations.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    UIModule,
    MatDialogModule,
    MatButtonModule,
    MatRippleModule,
  ],
  declarations: [
    // Layouts
    AssetLayoutComponent,
    DefaultLayoutComponent,
    FullLayoutComponent,
    LoginLayoutComponent,
    MobileTerminalLayoutComponent,

    // Components
    LoginComponent,
    UnauthorizedComponent,
    LogoutComponent,
    TopMenuComponent,
    TypescriptTranslationsComponent,
    NotificationsComponent,
    NotFoundComponent,
    LoggedOutDialogComponent,
    LogoutTimerComponent,
  ],
  exports: [
    LoggedOutDialogComponent,
  ],
  providers: [
    AuthGuard,
    FishingGuard
  ]
})

export class CoreModule { }
