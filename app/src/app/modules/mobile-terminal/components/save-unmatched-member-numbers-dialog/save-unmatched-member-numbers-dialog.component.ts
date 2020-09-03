import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetTypes } from '@data/asset';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mobile-terminal-save-unmatched-member-numbers-dialog',
  templateUrl: './save-unmatched-member-numbers-dialog.component.html',
  styleUrls: ['./save-unmatched-member-numbers-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SaveUnmatchedMemberNumbersDialogComponent {
  constructor(public dialogRef: MatDialogRef<SaveUnmatchedMemberNumbersDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
