import { Component, Input } from '@angular/core';

@Component({
  selector: 'core-top-menu-component',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})

export class TopMenuComponent {
  @Input() appVersion: string;
}
