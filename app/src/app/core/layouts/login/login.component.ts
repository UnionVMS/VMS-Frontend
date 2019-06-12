import { Component } from '@angular/core';
import { version } from '@app/../../package.json';

@Component({
  selector: 'core-login-layout-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginLayoutComponent {
  public appVersion: string = version;
}
