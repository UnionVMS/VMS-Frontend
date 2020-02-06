import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UIModule } from '@modules/ui/ui.module';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Layouts
import { AssetLayoutComponent } from './layouts/asset/asset.component';
import { DefaultLayoutComponent } from './layouts/default/default.component';
import { LoginLayoutComponent } from './layouts/login/login.component';
import { FullLayoutComponent } from './layouts/full/full.component';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { NotFoundComponent } from './pages/404/404.component';

// Components
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { DontTranslateComponent } from './components/dont-translate/dont-translate.component';
import { TypescriptTranslationsComponent } from './components/typescript-translations/typescript-translations.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    UIModule,
  ],
  declarations: [
    AssetLayoutComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    FullLayoutComponent,
    LoginComponent,
    UnauthorizedComponent,
    LogoutComponent,
    TopMenuComponent,
    TypescriptTranslationsComponent,
    DontTranslateComponent,
    NotificationsComponent,
    NotFoundComponent,
  ],
  providers: [
    AuthGuard
  ]
})

export class CoreModule { }
