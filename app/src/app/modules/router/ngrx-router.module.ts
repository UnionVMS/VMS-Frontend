import { NgModule, Optional, Self } from '@angular/core';
import { routerReducer, RouterStateSerializer, StoreRouterConfig, StoreRouterConnectingModule } from '@ngrx/router-store';
import { reducers, metaReducers } from '@app/app-reducer';
import { StoreModule } from '@ngrx/store';
import { RouterState } from '@ngrx/router-store';
import { MergedRouterStateSerializer } from '@data/router/merged-route-serializer';
import { Router } from '@angular/router';

export const routerStateConfig = {
  stateKey: 'router', // state-slice name for routing state
  routerState: RouterState.Minimal, // For strict store runtimeChecks
};

@NgModule({
  imports: [
    StoreModule.forFeature(routerStateConfig.stateKey, routerReducer),
    StoreRouterConnectingModule.forRoot(routerStateConfig),
  ],
  exports: [
    StoreModule,
    StoreRouterConnectingModule
  ],
  providers: [
    {
      provide: RouterStateSerializer,
      useClass: MergedRouterStateSerializer,
    }
  ]
})
export class NgrxRouterStoreModule {
  constructor(@Self() @Optional() router: Router) {
    if (router) {
      console.log('All good, NgrxRouterStoreModule');
    } else {
      console.error('NgrxRouterStoreModule must be imported in the same same level as RouterModule');
    }
  }
}
