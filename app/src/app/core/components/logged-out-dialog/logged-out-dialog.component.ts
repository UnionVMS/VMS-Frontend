import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'core-logged-out-dialog',
  templateUrl: './logged-out-dialog.component.html',
  styleUrls: ['./logged-out-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoggedOutDialogComponent {
  constructor(public dialogRef: MatDialogRef<LoggedOutDialogComponent>) { }
}
