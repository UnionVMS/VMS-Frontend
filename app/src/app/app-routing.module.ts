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

// Map-pages
import { RealtimeComponent } from './modules/map/pages/realtime/realtime.component';

// Asset-pages
import { ListComponent as AssetListComponent } from './modules/asset/pages/list/list.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TestComponent, pathMatch: 'full'},
      { path: 'asset', component: AssetListComponent, pathMatch: 'full'},
      { path: 'test', component: TestComponent, pathMatch: 'full'},
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
  { path: '**', component: TestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
