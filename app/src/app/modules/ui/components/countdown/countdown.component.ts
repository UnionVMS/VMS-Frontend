import { Component, Input, OnInit } from '@angular/core';

import { Observable, timer } from 'rxjs';
import { take, map, finalize } from 'rxjs/operators';

@Component({
   selector: 'ui-countdown',
   template: `<span>{{counter$ | async}}</span>`,
   styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {
  @Input() seconds: number;
  @Input() doneFunction: () => void;

  public counter$: Observable<number>;
  public count: number;

  ngOnInit() {
    // @ts-ignore-line
    this.count = parseInt(this.seconds, 10);
    this.counter$ = timer(0, 1000).pipe(
      take(this.count),
      finalize(() => this.doneFunction()),
      map(() => --this.count),
    );
  }
}
