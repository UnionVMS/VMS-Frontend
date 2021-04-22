import { Component, OnChanges, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import { AssetTypes } from '@data/asset';

// @ts-ignore
import moment from 'moment-timezone';

type ExtendedMovement = Readonly<AssetTypes.Movement & {
  formattedTimestamp: string;
  formattedSpeed: string,
  oceanRegion: string;
  source: string;
}>;

@Component({
  selector: 'asset-show-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnChanges {

  @Input() positions: ReadonlyArray<AssetTypes.Movement>;
  @Input() coordinateFormat: string;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedPositions: ReadonlyArray<ExtendedMovement>;
  public sortedPositions: ReadonlyArray<ExtendedMovement>;

  public displayedColumns: string[] = ['timestamp', 'latitude', 'longitude', 'speed', 'heading','sourceSatelliteId', 'oceanRegion', 'status', 'source'];

  ngOnChanges() {
    if(typeof this.positions === 'undefined') {
      this.formattedPositions = [];
    } else {
      this.formattedPositions = this.positions.map(position => ({
        ...position,
        locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude),
        formattedTimestamp: formatUnixtime(position.timestamp),
        formattedSpeed: typeof position.speed === 'number' ? position.speed.toFixed(2) : '',
        sourceSatelliteId: position.sourceSatelliteId,
        oceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId],
        source: position.source
      }));
      this.sortData({ active: 'timestamp', direction: 'desc' });
    }
  }

  sortData(sort: Sort) {
    const positions = this.formattedPositions.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedPositions = positions;
      return;
    }

    this.sortedPositions = positions.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'timestamp': return compareTableSortNumber(a.timestamp, b.timestamp, isAsc);
        case 'latitude': return compareTableSortNumber(a.location.latitude, b.location.latitude, isAsc);
        case 'longitude': return compareTableSortNumber(a.location.longitude, b.location.longitude, isAsc);
        case 'speed': return compareTableSortNumber(a.speed, b.speed, isAsc);
        case 'heading': return compareTableSortNumber(a.heading, b.heading, isAsc);
        case 'oceanRegion': return compareTableSortString(a.oceanRegion, b.oceanRegion, isAsc);
        case 'status': return compareTableSortString(a.status, b.status, isAsc);
        case 'source': return compareTableSortString(a.source, b.source, isAsc);
        default: return 0;
      }
    });
  }

  exportPositionsToCSV() {
    const nrOfColumns = this.displayedColumns.length;
    const nrOfRows = this.sortedPositions.length;
    const positionsForCSV = this.sortedPositions.map(position => ({
      ...position,
      timestamp: formatUnixtime(position.timestamp),
      latitude: position.location.latitude.toFixed(6),
      longitude: position.location.longitude.toFixed(6),
      speed: typeof position.speed === 'number' ? position.speed.toFixed(2) : '',
      sourceSatelliteId: position.sourceSatelliteId,
      oceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId],
      source: position.source
    }));
    let csv = this.displayedColumns.reduce((csvRow, column, index) => {
      return csvRow + column + (nrOfColumns !== index + 1 ? ';' : '');
    }, '') + '\r\n';

    csv = csv + positionsForCSV.reduce((acc, pos, mtIndex) => {
      return acc + this.displayedColumns.reduce((csvRow, column, index) => {
        return csvRow +
          (typeof pos[column] !== 'undefined' ? pos[column] : '') +
          (nrOfColumns !== index + 1 ? ';' : '');
      }, '') + (nrOfRows !== mtIndex + 1 ? '\r\n' : '');
    }, '');

    const exportedFilenmae = 'lastPositions.' + moment().format('YYYY-MM-DD.HH_mm') + '.csv';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFilenmae);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

}
