import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

// Layouts
import { DefaultLayoutComponent } from './core/layouts/default/default.component';
import { LoginLayoutComponent } from './core/layouts/login/login.component';
import { FullLayoutComponent } from './core/layouts/full/full.component';
import { AssetLayoutComponent } from './core/layouts/asset/asset.component';

// Core-pages
import { LoginComponent } from './core/pages/login/login.component';
import { UnauthorizedComponent } from './core/pages/unauthorized/unauthorized.component';
import { LogoutComponent } from './core/pages/logout/logout.component';
import { NotFoundComponent } from './core/pages/404/404.component';

// Map-pages
import { RealtimeComponent } from './modules/map/pages/realtime/realtime.component';
import { ReportsComponent } from './modules/map/pages/reports/reports.component';

// Asset-pages
import { SearchPageComponent as AssetSearchPage } from './modules/asset/pages/search/search.component';
import { PositionsPageComponent as AssetPositionsPage } from './modules/asset/pages/positions/positions.component';
import { FormPageComponent as AssetFormPage } from './modules/asset/pages/form/form.component';
import { ShowPageComponent as AssetShowPage } from './modules/asset/pages/show/show.component';

// MobileTerminal-pages
import { AttachPageComponent as MobileTerminalAttachPage } from './modules/mobile-terminal/pages/attach/attach.component';
import { FormPageComponent as MobileTerminalFormPage } from './modules/mobile-terminal/pages/form/form.component';
import { ListPageComponent as MobileTerminalListPage } from './modules/mobile-terminal/pages/list/list.component';
import {
  ShowByAssetPageComponent as MobileTerminalsShowByAssetPage
} from './modules/mobile-terminal/pages/show-by-asset/show-by-asset.component';

// Contact-pages
import { FormPageComponent as ContactFormPage } from './modules/contact/pages/form/form.component';
import { ShowByAssetPageComponent as ContactShowByAssetPage } from './modules/contact/pages/show-by-asset/show-by-asset.component';

// Notes-pages
import { FormPageComponent as NotesFormPage } from './modules/notes/pages/form/form.component';
import { NotesListComponent as NotesListPage } from './modules/notes/pages/list/list.component';


// Settings-pages
import { UserSettingsComponent } from './modules/settings/pages/user-settings/user-settings.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'settings/user', component: UserSettingsComponent, pathMatch: 'full'},
      { path: 'contact/:contactId/edit', component: ContactFormPage, pathMatch: 'full' },
      { path: 'contact/:assetId/create', component: ContactFormPage, pathMatch: 'full' },
      { path: 'notes/:noteId/edit', component: NotesFormPage, pathMatch: 'full' },
      { path: 'notes/:assetId/create', component: NotesFormPage, pathMatch: 'full' },
      { path: 'logout', component: LogoutComponent, pathMatch: 'full'}
    ]
  },
  {
    path: '',
    component: AssetLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'asset/create', component: AssetFormPage, pathMatch: 'full', data: {
          title: $localize`:@@ts-layout-asset-create:Assets — Create asset` || 'Assets — Create asset'
        }
      },
      { path: 'asset/:assetId/edit', component: AssetFormPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-edit:<dont-translate>assetName</dont-translate> — Edit asset` || 'Edit asset'
      }},
      { path: 'asset/:assetId/mobileTerminals', component: MobileTerminalsShowByAssetPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-info:<dont-translate>assetName</dont-translate> — Mobile Terminals` || 'Mobile Terminals'
      }},
      { path: 'asset/:assetId', component: AssetShowPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-info:<dont-translate>assetName</dont-translate> — Asset information` || 'Asset infromation'
      }},
      { path: 'asset', component: AssetSearchPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-search:Assets — Asset search` || 'Asset search'
      }},
      { path: 'mobileTerminals', component: MobileTerminalListPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-mobileTerminal-list:Mobile Terminals — List` || 'Mobile Terminals - List'
      }},
      { path: 'asset/:assetId/mobileTerminal/attach', component: MobileTerminalAttachPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-mobileTerminal-edit:<dont-translate>assetName</dont-translate> — Attach Mobile Terminal`
          || 'Attach Mobile Terminal'
      }},
      { path: 'asset/:assetId/mobileTerminal/create', component: MobileTerminalFormPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-mobileTerminal-create:<dont-translate>assetName</dont-translate> — Mobile Terminal`
          || 'Create Mobile Terminal'
      }},
      { path: 'asset/:assetId/mobileTerminal/:mobileTerminalId/edit', component: MobileTerminalFormPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-mobileTerminal-edit:<dont-translate>assetName</dont-translate> — Mobile Terminal`
          || 'Edit Mobile Terminal'
      }},
      { path: 'asset/:assetId/contacts', component: ContactShowByAssetPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-contacts:<dont-translate>assetName</dont-translate> — Contacts` || 'Contacts'
      }},
      { path: 'asset/:assetId/notes', component: NotesListPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-notes:<dont-translate>assetName</dont-translate> — Notes` || 'Notes'
      }},
      { path: 'asset/:assetId/positions', component: AssetPositionsPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-positions:<dont-translate>assetName</dont-translate> — Last positions` || 'Last positions'
      }},
      { path: 'asset/:assetId/notes/:noteId/edit', component: NotesFormPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-notes-edit:Notes — Edit` || 'Notes — Edit'
      }},
    ]
  },
  {
    path: '',
    component: FullLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'map/realtime', component: RealtimeComponent, pathMatch: 'full'},
      { path: 'map/realtime/:assetId', component: RealtimeComponent, pathMatch: 'full'},
      { path: 'map/reports', component: ReportsComponent, pathMatch: 'full'}
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      { path: 'unauthorized', component: UnauthorizedComponent, pathMatch: 'full'},
      { path: 'login', component: LoginComponent, pathMatch: 'full'}
    ]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
