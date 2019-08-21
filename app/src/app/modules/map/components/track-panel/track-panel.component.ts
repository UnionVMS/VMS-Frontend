import { Component, OnInit, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';
import { AssetInterfaces } from '@data/asset';
import { TrackColumn } from './track-column.model';

@Component({
  selector: 'map-track-panel',
  templateUrl: './track-panel.component.html',
  styleUrls: ['./track-panel.component.scss']
})

export class TrackPanelComponent implements OnInit {
  @Input() positions: { [id: number]: AssetInterfaces.Movement };
  @Input() removePositionForInspection: (inspectionId: string) => void;

  public columns: TrackColumn[] = [];
  public hidePanel = true;
  public hideTrackColumnSetting = true;

  ngOnInit() {
    this.columns.push({ id: 1, columnName: 'Id', width: 150, visible: true });
    this.columns.push({ id: 2, columnName: 'Lat', width: 150, visible: true });
    this.columns.push({ id: 3, columnName: 'Long', width: 150, visible: true });
    this.columns.push({ id: 4, columnName: 'Heading', width: 150, visible: true });
    this.columns.push({ id: 5, columnName: 'Speed', width: 150, visible: true });
    this.columns.push({ id: 6, columnName: 'Time', width: 150, visible: true });
    this.columns.push({ id: 7, columnName: 'Source', width: 150, visible: true });
  }

  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  toggleTrackColumnSetting() {
    this.hideTrackColumnSetting = !this.hideTrackColumnSetting;
  }

  private toggleColumnSetting = (idx) => {
    return () => this.setColumnSetting(idx);
  }

  private setColumnSetting = (idx): void => {
    this.columns[idx].visible = !this.columns[idx].visible;
  }

  positionKeys() {
    return Object.keys(this.positions);
  }

  getFormatedDate(date) {
    return formatDate(date);
  }
}
