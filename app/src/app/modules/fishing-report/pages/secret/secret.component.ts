import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { State } from '@app/app-reducer';
import { AuthActions } from '@data/auth';

@Component({
  selector: 'fishing-report-secret-page',
  templateUrl: './secret.component.html',
  styleUrls: ['./secret.component.scss']
})
export class SecretPageComponent implements OnInit, AfterViewInit {

  @ViewChild('secret') secretElement: ElementRef;

  public submitSecret: (secret: string) => void;

  constructor(private readonly store: Store<State>, private readonly router: Router) { }

  ngAfterViewInit() {
    setTimeout(() => this.secretElement.nativeElement.focus());
  }

  mapDispatchToProps() {
    this.submitSecret = (secret: string) => {
      if(secret === '1337') {
        this.store.dispatch(AuthActions.unlockFishingActivity());
        this.router.navigate(['/fishing-report']);
      }
    };
  }

  ngOnInit() {
    this.mapDispatchToProps();
  }

}
