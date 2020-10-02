import { Component, OnChanges, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { compareTableSortString, compareTableSortNumber } from '@app/helpers/helpers';
import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import { State } from '@app/app-reducer';
import { AssetTypes, AssetActions, AssetSelectors } from '@data/asset';
import { RouterTypes, RouterSelectors } from '@data/router';

type ExtendedMovement = Readonly<AssetTypes.FullMovement & {
  formattedTimestamp: string;
  formattedSpeed: string,
  formattedOceanRegion: string;
}>;

@Component({
  selector: 'asset-show-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnChanges {

  @Input() positions: ReadonlyArray<AssetTypes.FullMovement>;
  @Input() coordinateFormat: string;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedPositions: ReadonlyArray<ExtendedMovement>;
  public sortedPositions: ReadonlyArray<ExtendedMovement>;

  public displayedColumns: string[] = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'formattedOceanRegion', 'status'];


  ngOnChanges() {
    if(typeof this.positions === 'undefined') {
      this.formattedPositions = [];
    } else {
      this.formattedPositions = this.positions.map(position => ({
        ...position,
        locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude),
        formattedTimestamp: formatUnixtime(position.timestamp),
        formattedSpeed: position.speed.toFixed(2),
        formattedOceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId]
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
        case 'formattedOceanRegion': return compareTableSortString(a.formattedOceanRegion, b.formattedOceanRegion, isAsc);
        case 'status': return compareTableSortString(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }
}
