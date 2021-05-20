import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@app/core/guards/auth.guard';

// Layouts
import { DefaultLayoutComponent } from '@app/core/layouts/default/default.component';
import { LoginLayoutComponent } from '@app/core/layouts/login/login.component';

// Core-pages
import { LoginComponent } from '@app/core/pages/login/login.component';
import { UnauthorizedComponent } from '@app/core/pages/unauthorized/unauthorized.component';
import { LogoutComponent } from '@app/core/pages/logout/logout.component';
import { NotFoundComponent } from '@app/core/pages/404/404.component';

// Import other routes
import { vmsRoutes } from './vms-routing';


const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'logout', component: LogoutComponent, pathMatch: 'full'},
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
  ...vmsRoutes,
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
