import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { getRouterData } from '../../data/router/router.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'core-layout',
  templateUrl: './layout.component.html'
})

export class LayoutComponent implements OnInit, OnDestroy {
  layout: string;
  private subscriptions: Array<Subscription> = [];

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.layout = 'default';
    // this.subscriptions.push(this.store.select(getRouterData).subscribe((data: any) =>
    //   this.layout = typeof data.layout !== 'undefined' ? data.layout : 'default'
    // ));
  }

  ngOnDestroy() {
    this.subscriptions.map(sub => sub.unsubscribe());
  }
}
