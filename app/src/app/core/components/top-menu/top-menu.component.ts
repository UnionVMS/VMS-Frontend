import { Component, Input, OnInit } from '@angular/core';
import { AuthSelectors } from '@data/auth';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'core-top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})

export class TopMenuComponent implements OnInit{
  public isAdmin;
  constructor(
    private store: Store<any>
  ){
  }
  ngOnInit(){
    this.store.select(AuthSelectors.isAdmin)
      .subscribe((isAdmin: boolean) => this.isAdmin = isAdmin);
}
  @Input() appVersion: string;
}

