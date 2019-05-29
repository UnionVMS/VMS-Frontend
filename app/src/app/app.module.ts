import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';

// ngrx apparently removed payload from the Action interface since they tought it was optional
// This is against flux patterns which dictates that a Action consists of a type and a payload.
// For flexibility purpouses we will add payload as an optional instead.
// We are patching for TS linting sake.
declare module '@ngrx/store' {
  interface Action {
    type: string;
    payload?: any;
  }
}

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { reducers, metaReducers } from './app-reducer';
import { environment } from '../environments/environment';

/* Modules */
import { CoreModule } from './core/core.module';
import { MapModule } from './modules/map/map.module';
import { AssetModule } from './modules/asset/asset.module';
import { SettingsModule } from './modules/settings/settings.module';

/* Effects */
import { AssetEffects } from './data/asset/asset.effects';
import { AuthEffects } from './data/auth/auth.effects';

/* Services */
import { AuthService } from './data/auth/auth.service';

/* Components */
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states2
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreRouterConnectingModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    EffectsModule.forRoot([AuthEffects, AssetEffects]),
    BrowserAnimationsModule,
    MDBBootstrapModule.forRoot(),
    CoreModule,
    MapModule,
    AssetModule,
    SettingsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
