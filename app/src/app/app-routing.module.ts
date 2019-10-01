import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestComponent } from './test/test.component';
import { AuthGuard } from './core/guards/auth.guard';

// Layouts
import { DefaultLayoutComponent } from './core/layouts/default/default.component';
import { LoginLayoutComponent } from './core/layouts/login/login.component';
import { FullLayoutComponent } from './core/layouts/full/full.component';


// Core-pages
import { LoginComponent } from './core/pages/login/login.component';
import { UnauthorizedComponent } from './core/pages/unauthorized/unauthorized.component';
import { LogoutComponent } from './core/pages/logout/logout.component';
import { NotFoundComponent } from './core/pages/404/404.component';

// Map-pages
import { RealtimeComponent } from './modules/map/pages/realtime/realtime.component';

// Asset-pages
import { SearchPageComponent as AssetSearchPage } from './modules/asset/pages/search/search.component';
import { FormPageComponent as AssetFormPage } from './modules/asset/pages/form/form.component';
import { ShowPageComponent as AssetShowPage } from './modules/asset/pages/show/show.component';

// MobileTerminal-pages
import { FormPageComponent as MobileTerminalFormPage } from './modules/mobile-terminal/pages/form/form.component';

// Settings-pages
import { UserSettingsComponent } from './modules/settings/pages/user-settings/user-settings.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TestComponent, pathMatch: 'full'},
      { path: 'settings/user', component: UserSettingsComponent, pathMatch: 'full'},
      { path: 'asset/edit/:assetId', component: AssetFormPage, pathMatch: 'full'},
      { path: 'asset/show/:assetId', component: AssetShowPage, pathMatch: 'full'},
      { path: 'asset/create', component: AssetFormPage, pathMatch: 'full'},
      { path: 'asset', component: AssetSearchPage, pathMatch: 'full'},
      { path: 'mobileTerminal/edit/:mobileTerminalId', component: MobileTerminalFormPage, pathMatch: 'full' },
      { path: 'mobileTerminal/create/:assetId', component: MobileTerminalFormPage, pathMatch: 'full' },
      { path: 'logout', component: LogoutComponent, pathMatch: 'full'},
    ]
  },
  {
    path: '',
    component: FullLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'map/realtime', component: RealtimeComponent, pathMatch: 'full'}
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      { path: 'unauthorized', component: UnauthorizedComponent, pathMatch: 'full'},
      { path: 'login', component: LoginComponent, pathMatch: 'full'},
    ]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
