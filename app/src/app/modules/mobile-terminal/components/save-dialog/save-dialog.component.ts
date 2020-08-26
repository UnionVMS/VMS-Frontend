import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetTypes } from '@data/asset';
import { MapSavedFiltersTypes } from '@data/map-saved-filters';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mobile-terminal-save-dialog',
  templateUrl: './save-dialog.component.html',
  styleUrls: ['./save-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SaveDialogComponent {

  public note = new FormControl('', Validators.required);

  constructor(public dialogRef: MatDialogRef<SaveDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    return this.note.value;
  }
}
