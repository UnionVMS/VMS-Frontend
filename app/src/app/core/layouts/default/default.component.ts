import { Component } from '@angular/core';
import { version } from '@app/../../package.json';

@Component({
  selector: 'core-default-layout-component',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})

export class DefaultLayoutComponent {
  public appVersion: string = version;
}
