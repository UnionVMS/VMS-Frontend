import { Component } from '@angular/core';
import { version } from '@app/../../package.json';

@Component({
  selector: 'core-full-layout-component',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})

export class FullLayoutComponent {
  public appVersion: string = version;
}
