import { Component, Input } from '@angular/core';

@Component({
  selector: 'core-top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})

export class TopMenuComponent{
  public baseUrl = window.location.origin;

  @Input() appVersion: string;
  @Input() isAdmin: boolean;
}

