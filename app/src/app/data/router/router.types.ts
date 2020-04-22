import { Data, Params } from '@angular/router';
import { RouterReducerState } from '@ngrx/router-store';

export type MergedRoute = Readonly<{
  url: string;
  queryParams: Params;
  params: Params;
  data: Data;
}>;

export type MergedRouteReducerState = RouterReducerState<MergedRoute>;
