import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mobile-terminal-detach-dialog',
  templateUrl: './detach-dialog.component.html',
  styleUrls: ['./detach-dialog.component.scss']
})
export class DetachDialogComponent {

  constructor(public dialogRef: MatDialogRef<DetachDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
