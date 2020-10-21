import { HttpHeaders, HttpParams } from '@angular/common/http';

type HttpOptionsType = {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    observe: 'response';
    params?: HttpParams | {
        [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
};

export const getDefaultHttpOptions = (authToken: string): HttpOptionsType => ({
  headers: new HttpHeaders({
    Authorization: authToken,
    'Cache-Control': 'no-cache'
  }),
  observe: 'response',
});
