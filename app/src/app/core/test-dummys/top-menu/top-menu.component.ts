import { Component, Input } from '@angular/core';

@Component({
  selector: 'core-top-menu-component',
})
export class TopMenuComponent {
  @Input() appVersion: string;
  @Input() isAdmin: boolean;
  @Input() setTimezone: (timezone: string) => void;
  @Input() timezone: string;
  @Input() fishingActivityUnlocked: boolean;
  @Input() timeToLogout: number | null;
  @Input() url: string;
}
