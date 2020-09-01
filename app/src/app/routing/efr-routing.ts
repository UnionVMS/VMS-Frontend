import { Routes } from '@angular/router';

import { AuthGuard } from '@app/core/guards/auth.guard';
import { FishingGuard } from '@app/core/guards/fishing.guard';

// Layouts
import { DefaultLayoutComponent } from '@app/core/layouts/default/default.component';
import { FishingReportLayoutComponent } from '@app/core/layouts/efr/fishing-report/fishing-report.component';
import { EfrDefaultLayoutComponent } from '@app/core/layouts/efr/efr-default/efr-default.component';

// Fishing-report-pages
import { SearchPageComponent as FishingReportSearchPage } from '@app/modules/fishing-report/pages/search/search.component';
import { ShowPageComponent as FishingReportShowPage } from '@app/modules/fishing-report/pages/show/show.component';
import { SecretPageComponent as FishingReportSecretPage } from '@app/modules/fishing-report/pages/secret/secret.component';

export const efrRoutes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'secret', component: FishingReportSecretPage, pathMatch: 'full'},
    ]
  },
  {
    path: 'efr',
    component: EfrDefaultLayoutComponent,
    canActivate: [AuthGuard, FishingGuard],
    children: [
      { path: 'overview', component: FishingReportSearchPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-efr-overview:Collected overview` || 'Collected overview'
      }},
    ]
  },
  {
    path: '',
    component: FishingReportLayoutComponent,
    canActivate: [AuthGuard, FishingGuard],
    children: [
      { path: 'fishing-report', component: FishingReportSearchPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-fishing-report-search:Fishing report — Search` || 'Fishing report — Search'
      }},
      { path: 'fishing-report/:fishingReportId', component: FishingReportShowPage, pathMatch: 'full', data: {
        title: $localize`:@@ts-layout-fishing-report-info:<dont-translate>fishingReportCfr</dont-translate> — Fishing report information` || 'Fishing report — information'
      }},
    ]
  },
];
