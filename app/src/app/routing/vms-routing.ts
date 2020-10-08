import { Routes } from '@angular/router';

import { AuthGuard } from '@app/core/guards/auth.guard';

// Layouts
import { DefaultLayoutComponent } from '@app/core/layouts/default/default.component';
import { FullLayoutComponent } from '@app/core/layouts/full/full.component';
import { AssetLayoutComponent } from '@app/core/layouts/asset/asset.component';
import { MobileTerminalLayoutComponent } from '@app/core/layouts/mobile-terminal/mobile-terminal.component';

// Map-pages
import { RealtimeComponent } from '@app/modules/map/pages/realtime/realtime.component';
import { ReportsComponent } from '@app/modules/map/pages/reports/reports.component';

// Asset-pages
import { SearchPageComponent as AssetSearchPage } from '@app/modules/asset/pages/search/search.component';
import { PositionsPageComponent as AssetPositionsPage } from '@app/modules/asset/pages/positions/positions.component';
import { FormPageComponent as AssetFormPage } from '@app/modules/asset/pages/form/form.component';
import { ShowPageComponent as AssetShowPage } from '@app/modules/asset/pages/show/show.component';

// Contact-pages
import { FormPageComponent as ContactFormPage } from '@app/modules/contact/pages/form/form.component';
import { ShowByAssetPageComponent as ContactShowByAssetPage } from '@app/modules/contact/pages/show-by-asset/show-by-asset.component';

// MobileTerminal-pages
import { AttachPageComponent as MobileTerminalAttachPage } from '@app/modules/mobile-terminal/pages/attach/attach.component';
import { FormPageComponent as MobileTerminalFormPage } from '@app/modules/mobile-terminal/pages/form/form.component';
import { ListPageComponent as MobileTerminalListPage } from '@app/modules/mobile-terminal/pages/list/list.component';
import { ShowPageComponent as MobileTerminalShowPage } from '@app/modules/mobile-terminal/pages/show/show.component';
import {
  ShowByAssetPageComponent as MobileTerminalsShowByAssetPage
} from '@app/modules/mobile-terminal/pages/show-by-asset/show-by-asset.component';
import {
  AttachmentHistoryPageComponent as MobileTerminalAttachmentHistoryPage
} from '@app/modules/mobile-terminal/pages/attachment-history/attachment-history.component';
import { HistoryPageComponent as MobileTerminalHistoryPage } from '@app/modules/mobile-terminal/pages/history/history.component';


// Notes-pages
import { FormPageComponent as NotesFormPage } from '@app/modules/notes/pages/form/form.component';
import { ListPageComponent as NotesListPage } from '@app/modules/notes/pages/list/list.component';

// Settings-pages
import { UserSettingsComponent } from '@app/modules/settings/pages/user-settings/user-settings.component';

export const vmsRoutes: Routes = [
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
        title: $localize`:@@ts-layout-asset-info:<dont-translate>assetName</dont-translate> — Asset information` || 'Asset information'
      }},
      { path: 'asset', component: AssetSearchPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-asset-search:Assets — Asset search` || 'Asset search'
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
    component: MobileTerminalLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'mobileTerminals', component: MobileTerminalListPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-mobileTerminal-list:Mobile Terminal — List` || 'Mobile Terminal - List'
      }},
      { path: 'mobileTerminal/:mobileTerminalId', component: MobileTerminalShowPage, pathMatch: 'full', data: {
        // tslint:disable-next-line:max-line-length
        title: $localize`:@@ts-layout-mobileTerminal-show:<dont-translate>mobileTerminalName</dont-translate> — Mobile Terminal information` || 'Mobile Terminal information'
      }},
      { path: 'mobileTerminal/:mobileTerminalId/edit', component: MobileTerminalFormPage, pathMatch: 'full', data: {
        // tslint:disable-next-line:max-line-length
        title: $localize`:@@ts-layout-mobileTerminal-edit:<dont-translate>mobileTerminalName</dont-translate> — Mobile Terminal edit` || 'Mobile Terminal edit'
      }},
      {
        path: 'mobileTerminal/:mobileTerminalId/attachment-history',
        component: MobileTerminalAttachmentHistoryPage, pathMatch: 'full', data: {
        // tslint:disable-next-line:max-line-length
        title: $localize`:@@ts-layout-mobileTerminal-attachment-history:<dont-translate>mobileTerminalName</dont-translate> — Mobile Terminal attachment history` || 'Mobile Terminal attachment history'
      }},
      {
        path: 'mobileTerminal/:mobileTerminalId/history', component: MobileTerminalHistoryPage, pathMatch: 'full', data: {
        // tslint:disable-next-line:max-line-length
        title: $localize`:@@ts-layout-mobileTerminal-history:<dont-translate>mobileTerminalName</dont-translate> — Mobile Terminal history` || 'Mobile Terminal history'
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
];
