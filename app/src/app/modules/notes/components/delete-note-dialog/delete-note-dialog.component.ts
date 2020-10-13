import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'notes-delete-note-dialog',
  templateUrl: './delete-note-dialog.component.html'
})
export class DeleteNoteDialogDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { username: string, timestamp: string, userTimezone: string }) {}
}
