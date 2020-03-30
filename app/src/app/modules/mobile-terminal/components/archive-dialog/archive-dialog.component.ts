import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mobile-terminal-archive-dialog',
  templateUrl: './archive-dialog.component.html',
  styleUrls: ['./archive-dialog.component.scss']
})
export class ArchiveDialogComponent {

  constructor(public dialogRef: MatDialogRef<ArchiveDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
