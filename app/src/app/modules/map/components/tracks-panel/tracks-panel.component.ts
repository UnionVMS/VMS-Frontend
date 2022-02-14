import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { formatUnixtimeSeconds } from '@app/helpers/datetime-formatter';
import { compareTableSortNumber, compareTableSortString } from '@app/helpers/helpers';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';
import { AssetTypes } from '@data/asset';

type ExtendedMovement = Readonly<AssetTypes.Movement & {
  formattedTimestamp: string;
  formattedSpeed: string,
  formattedCalculatedSpeed: string,
  oceanRegion: string;
  source: string;
}>;

@Component({
  selector: 'map-tracks-panel',
  templateUrl: './tracks-panel.component.html',
  styleUrls: ['./tracks-panel.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TracksPanelComponent implements OnChanges {

  @Input() track: Readonly<AssetTypes.AssetTrack>;
  @Input() selectedMovement: string;
  @Input() selectMovement: (movementId: string) => void;
  @Input() panelExpanded: boolean;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedPositions: ReadonlyArray<ExtendedMovement>;
  public sortedPositions: ReadonlyArray<ExtendedMovement>;
  public expandedElement: ExtendedMovement | null;

  public displayedColumns: string[] = ['timestamp', 'source'];

  private defaultSorting: Sort = { active: 'timestamp', direction: 'desc' };
  private currentSorting: Sort = this.defaultSorting;

  private latestPanelExpanded: boolean;

  ngOnChanges() {
    if(this.panelExpanded) {
      this.displayedColumns = ['timestamp', 'latitude', 'longitude', 'speed', 'heading', 'source'];
    } else {
      this.displayedColumns = ['timestamp', 'source'];
      this.currentSorting = this.defaultSorting;
    }
    if (this.latestPanelExpanded !== this.panelExpanded) {
      this.expandedElement = null;
    }
    this.latestPanelExpanded = this.panelExpanded;
    if(typeof this.track === 'undefined' || typeof this.track.tracks === 'undefined') {
      this.formattedPositions = [];
    } else {
      this.formattedPositions = this.track.tracks.map(position => ({
        ...position,
        locationDDM: convertDDToDDM(position.location.latitude, position.location.longitude, 2),
        formattedTimestamp: formatUnixtimeSeconds(position.timestamp),
        formattedSpeed: typeof position.speed === 'number' ? position.speed.toFixed(2) : '',
        formattedCalculatedSpeed: typeof position.calculatedSpeed === 'number' ? position.speed.toFixed(2) : '',
        sourceSatelliteId: position.sourceSatelliteId,
        oceanRegion: AssetTypes.OceanRegionTranslation[position.sourceSatelliteId],
        source: position.source
      }));
      this.sortData(this.currentSorting);
    }
  }

  sortData(sort: Sort) {
    this.currentSorting = sort;
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
        case 'source': return compareTableSortString(a.source, b.source, isAsc);
        default: return 0;
      }
    });
  }
}