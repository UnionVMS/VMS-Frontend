import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'map-asset-incidents-dialog',
  templateUrl: './asset-incidents-dialog.component.html',
  styleUrls: ['./asset-incidents-dialog.component.scss']
})
export class AssetIncidentsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { currentWorkflow: string, incidentType: string }) {}
}
