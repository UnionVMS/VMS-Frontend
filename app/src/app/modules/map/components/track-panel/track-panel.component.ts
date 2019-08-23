import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';
import { AssetInterfaces } from '@data/asset';
import { TrackPanelInterfaces } from '@data/track-panel';
import { TrackColumn } from './track-column.model';

@Component({
  selector: 'map-track-panel',
  templateUrl: './track-panel.component.html',
  styleUrls: ['./track-panel.component.scss']
})

export class TrackPanelComponent {
  @Input() positions: { [id: number]: AssetInterfaces.Movement };
  @Input() removePositionForInspection: (inspectionId: string) => void;
  @Input() trackPanelColumns: Array<TrackPanelInterfaces.TrackPanelColumn>;
  @Input() selectedTrackPanelColumns: Array<number>;
  @Input() setTrackPanelColumn: (trackPanelColumnId: number) => void;
  @Input() clearTrackPanelColumn: (trackPanelColumnId: number) => void;

  public columns: TrackColumn[] = [];
  public hidePanel = true;
  public hideTrackColumnSetting = true;

  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  private toggleColumnSettingFactory = (trackPanelColumnId: number) => {
    return () => this.toggleColumnSetting(trackPanelColumnId);
  }

  private toggleColumnSetting = (trackPanelColumnId: number): void => {
    console.warn(trackPanelColumnId);
    if(this.selectedTrackPanelColumns.includes(trackPanelColumnId)) {
      this.clearTrackPanelColumn(trackPanelColumnId);
    } else {
      this.setTrackPanelColumn(trackPanelColumnId);
    }
  }

  toggleTrackColumnSetting() {
    this.hideTrackColumnSetting = !this.hideTrackColumnSetting;
  }

  private isColumnVisible(columnId) {
    // console.warn(columnId);
    return this.selectedTrackPanelColumns.includes(columnId);
  }

  // private toggleColumnSetting = (idx) => {
  //   return () => this.setColumnSetting(idx);
  // }

  // private setColumnSetting = (idx): void => {
  //   this.columns[idx].visible = !this.columns[idx].visible;
  // }

  positionKeys() {
    return Object.keys(this.positions);
  }

  getFormatedDate(date) {
    return formatDate(date);
  }
}
