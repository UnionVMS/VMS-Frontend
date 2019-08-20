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
  public showTrackColumnSetting = false;

  ngOnInit() {
    this.columns.push({ id: 1, columnName: 'Id', width: 150, visible: true });
    this.columns.push({ id: 2, columnName: 'Lat', width: 150, visible: false });
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
    this.showTrackColumnSetting = !this.showTrackColumnSetting;
  }

  setColumnSetting(id: number) {
    const selectedItem = this.columns.find(item => item.id === id);
  }

  positionKeys() {
    // console.warn('Check positions: ', this.positions);
    return Object.keys(this.positions);
  }

  getFormatedDate(date) {
    return formatDate(date);
  }

  // clickCustomColumns(){

  // }
}
